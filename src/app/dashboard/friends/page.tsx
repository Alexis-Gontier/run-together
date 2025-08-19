import GroupMemberCard from "@/components/card/goup-member-card";
import FriendRunTable from "@/components/table/friend-run-table";
import PaginationFilter from "@/components/ui/pagination-filter";
import TextHeading from "@/components/ui/text-heading";

export default async function FriendsPage() {

  return (
    <>
      <TextHeading
        title="Mes amis"
        description="Voici la liste de mes amis."
      />
      <div className="grid grid-cols-3 gap-4">
        <GroupMemberCard />
        <GroupMemberCard />
        <GroupMemberCard />
        <GroupMemberCard />
        <GroupMemberCard />
        <GroupMemberCard />
      </div>
      <FriendRunTable />
      <PaginationFilter
        total={15}
        initialPage={1}
      />
    </>
  )
}
