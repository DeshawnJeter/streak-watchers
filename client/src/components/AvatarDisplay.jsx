// Backward-compat shim — new code should use CharacterAvatar directly.
import CharacterAvatar from './CharacterAvatar';

export default function AvatarDisplay({ avatar, size = 40, className = '' }) {
  return <CharacterAvatar avatar={avatar} size={size} className={className} />;
}
