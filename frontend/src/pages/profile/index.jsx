import { useAppStore } from "../../store/store";

const Profile = () => {
  const { userInfo } = useAppStore();

  return (
    <div>
      <h2>Profile</h2>
      <div>Email: {userInfo?.email ? userInfo.email : "Email not available"}</div>
    </div>
  );
};

export default Profile;
