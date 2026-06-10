"use client";

import { Layout } from "antd";
import { useState } from "react";

import UserSidebar from "./UserSidebar";
import MessageChat from "./MessageChat";

export default function Message() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <Layout>
      <UserSidebar
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <Layout.Content>
        <MessageChat selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </Layout.Content>
    </Layout>
  );
}