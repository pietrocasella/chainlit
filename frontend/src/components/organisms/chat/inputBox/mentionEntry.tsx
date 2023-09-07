import { MentionPluginTheme } from '@draft-js-plugins/mention';
import { ReactElement } from 'react';

import { IMention } from 'types/mention';

export interface MentionEntryComponentProps {
  className?: string;
  onMouseDown(event: React.MouseEvent<HTMLDivElement>): void;
  onMouseUp(event: React.MouseEvent<HTMLDivElement>): void;
  onMouseEnter(event: React.MouseEvent<HTMLDivElement>): void;
  role: string;
  id: string;
  'aria-selected'?: boolean | 'false' | 'true';
  theme?: MentionPluginTheme;
  mention: IMention;
  isFocused: boolean;
  searchValue?: string;
}

function MentionEntry(props: MentionEntryComponentProps): ReactElement {
  const {
    mention,
    theme,
    searchValue, // eslint-disable-line @typescript-eslint/no-unused-vars
    isFocused, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...parentProps
  } = props;

  return (
    <div {...parentProps}>
      <div className={theme?.mentionSuggestionsEntryContainer}>
        <div className={theme?.mentionSuggestionsEntryContainerLeft}>
          <img
            src={mention.avatar}
            className={theme?.mentionSuggestionsEntryAvatar}
            role="presentation"
          />
        </div>

        <div className={theme?.mentionSuggestionsEntryContainerRight}>
          <div className={theme?.mentionSuggestionsEntryText}>
            {mention.name}
          </div>

          <div className={theme?.mentionSuggestionsEntryTitle}>
            {mention.title}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentionEntry;
