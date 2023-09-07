import Editor from '@draft-js-plugins/editor';
import createMentionPlugin, {
  defaultSuggestionsFilter
} from '@draft-js-plugins/mention';
import { EditorState, RichUtils } from 'draft-js';
import { useColors } from 'helpers/color';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import SendIcon from '@mui/icons-material/Telegram';
import TuneIcon from '@mui/icons-material/Tune';
import { IconButton } from '@mui/material';
import Stack from '@mui/material/Stack';

import {
  askUserState,
  chatSettingsState,
  loadingState,
  sessionState
} from 'state/chat';
import { chatHistoryState } from 'state/chatHistory';

import { IMention } from 'types/mention';

import editorCss from './mention.module.css';
import 'draft-js/dist/Draft.css';

import HistoryButton from '../history';
import UploadButton from '../message/UploadButton';
import MentionEntry from './mentionEntry';

interface Props {
  onSubmit: (message: string) => void;
  onReply: (message: string) => void;
}

function useCustomStyleMap() {
  const colors = useColors(true);

  const customStyleMap: Record<string, Record<string, string>> = {};

  for (let i = 0; i < colors.length; i++) {
    customStyleMap[i.toString()] = {
      background: colors[i],
      borderRadius: '2px',
      cursor: 'pointer',
      color: 'red'
    };
  }

  return customStyleMap;
}
function getLineCount(el: HTMLDivElement) {
  const textarea = el.querySelector('textarea');
  if (!textarea) {
    return 0;
  }
  const lines = textarea.value.split('\n');
  return lines.length;
}

const Input = ({ onSubmit, onReply }: Props) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const customStyleMap = useCustomStyleMap();
  const ref = useRef<HTMLDivElement>(null);
  const setChatHistory = useSetRecoilState(chatHistoryState);
  const [chatSettings, setChatSettings] = useRecoilState(chatSettingsState);
  const loading = useRecoilValue(loadingState);
  const askUser = useRecoilValue(askUserState);
  const session = useRecoilValue(sessionState);
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);

  const socketOk = session?.socket && !session?.error;
  const disabled = !socketOk || loading || askUser?.spec.type === 'file';

  useEffect(() => {
    setValue(editorState.getCurrentContent().getPlainText());
  }, [editorState]);

  useEffect(() => {
    if (ref.current && !loading && !disabled) {
      ref.current.focus();
    }
  }, [loading, disabled]);

  const submit = useCallback(() => {
    if (value === '' || disabled) {
      return;
    }
    if (askUser) {
      onReply(value);
    } else {
      onSubmit(value);
    }
    setValue('');
  }, [value, disabled, setValue, askUser, onSubmit, onReply]);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (!isComposing) {
          e.preventDefault();
          submit();
        }
      } else if (e.key === 'ArrowUp') {
        const lineCount = getLineCount(e.currentTarget as HTMLDivElement);
        if (lineCount <= 1) {
          setChatHistory((old) => ({ ...old, open: true }));
        }
      }
    },
    [submit, setChatHistory, isComposing]
  );

  const onHistoryClick = useCallback((content: string) => {
    if (ref.current) {
      setValue(content);
    }
  }, []);

  function handleKeyCommand(command: any, editorState: any) {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return 'handled';
    }

    return 'not-handled';
  }

  const onOpenChange = useCallback((_open: boolean) => {
    setMentionOpen(_open);
  }, []);

  const mentions: IMention[] = [
    {
      name: 'Matthew Russell',
      link: 'https://twitter.com/mrussell247',
      avatar:
        'https://pbs.twimg.com/profile_images/517863945/mattsailing_400x400.jpg'
    },
    {
      name: 'Julian Krispel-Samsel',
      link: 'https://twitter.com/juliandoesstuff',
      avatar: 'https://avatars2.githubusercontent.com/u/1188186?v=3&s=400'
    }
  ];

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      mentionPrefix: '@',
      theme: editorCss
    });
    // eslint-disable-next-line no-shadow
    mentionPlugin;
    const { MentionSuggestions } = mentionPlugin;

    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const [suggestions, setSuggestions] = useState(mentions);

  const onSearchChange = useCallback(({ value }: { value: string }) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions));
  }, []);

  return (
    <div className={editorCss.editor}>
      <Stack direction="row" spacing={1}>
        <div>
          {chatSettings.inputs.length > 0 && (
            <IconButton
              disabled={disabled}
              color="inherit"
              onClick={() => setChatSettings((old) => ({ ...old, open: true }))}
            >
              <TuneIcon />
            </IconButton>
          )}
          <HistoryButton onClick={onHistoryClick} />
          <UploadButton />
        </div>
        <div
          className={editorCss.editor}
          style={{
            marginTop: 'auto',
            marginBottom: 'auto',
            width: '100%'
          }}
        >
          <Editor
            onFocus={handleCompositionStart} // tb if this is the idea
            onBlur={handleCompositionEnd}
            customStyleMap={customStyleMap}
            editorState={editorState}
            placeholder="Type your message here..."
            handleKeyCommand={handleKeyCommand}
            plugins={plugins}
            onChange={setEditorState}
          />
          <MentionSuggestions
            open={mentionOpen}
            onOpenChange={onOpenChange}
            suggestions={suggestions}
            onSearchChange={onSearchChange}
            entryComponent={MentionEntry}
            // popoverContainer={({ children }) => <div>{children}</div>}
            onAddMention={() => {
              // get the mention object selected
            }}
          />
        </div>

        <IconButton
          disabled={disabled}
          color="inherit"
          onClick={() => submit()}
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </div>
  );
};

export default Input;
