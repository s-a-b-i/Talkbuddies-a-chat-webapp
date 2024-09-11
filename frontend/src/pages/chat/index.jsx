import { Link } from "react-router-dom";
import { useAppStore } from "../../store/store";

const Chat = () => {
  const { userInfo } = useAppStore();

  return (
    <div>
      Chat
      <div>Email: {userInfo?.email ? userInfo.email : "No email found"}</div>
      <Link to="/profile">Go to Profile</Link> {/* Add link to /profile */}
    </div>
  );
};

export default Chat;
