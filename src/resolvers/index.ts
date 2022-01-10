import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import LostAndFoundResolver from "./LostAndFound";

export default [UsersResolver, TagsResolver, HostelResolver, LostAndFoundResolver] as const;
