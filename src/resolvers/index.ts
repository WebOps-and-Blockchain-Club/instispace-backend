import UsersResolver from "./Users";
import TagsResolver from "./Tags";
import HostelResolver from "./Hostel";
import LostAndFoundResolver from "./LostAndFound";
import AnnouncementResolver from "./Announcement";
import NetopResolver from "./Netop";
import CommentResolver from "./Comment";
import ReportResolver from "./Report";
import QueryResolver from "./MyQuery";
import ComplaintResolver from "./Complaint";
import EventResolver from "./Event";
import FeedbackResolver from "./Feedback";
import AmenitiesResolver from "./Amenities";
import ContactResolver from "./Contacts";
import UtilsResolver from "./Utils";
import CustomNotifResolver from "./Notification";

export default [
  UsersResolver,
  TagsResolver,
  HostelResolver,
  AnnouncementResolver,
  NetopResolver,
  CommentResolver,
  ReportResolver,
  LostAndFoundResolver,
  QueryResolver,
  ComplaintResolver,
  EventResolver,
  FeedbackResolver,
  AmenitiesResolver,
  ContactResolver,
  UtilsResolver,
  CustomNotifResolver,
] as const;
