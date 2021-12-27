import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import AnnouncementResolver from "./Announcement";

export default [UsersResolver, TagsResolver, HostelResolver, AnnouncementResolver] as const;
