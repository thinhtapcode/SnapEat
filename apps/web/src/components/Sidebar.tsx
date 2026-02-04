import React from "react";
import styled from "styled-components";

const SidebarWrapper = styled.div`
  background-color: #fff;
  padding: 1rem;
  width: 250px;
  height: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const Navigation = styled.ul`
  list-style: none;
  padding: 0;

  li {
    margin: 1rem 0;
  }

  a {
    text-decoration: none;
    color: #6aa84f;
    font-weight: bold;
  }
`;

const Sidebar: React.FC = () => {
  return (
    <SidebarWrapper>
      <h3>SnapEat</h3>
      <Navigation>
        <li><a href="/home">Home</a></li>
        <li><a href="/daily-log">Daily Log</a></li>
        <li><a href="/meal-plan">Meal Plan</a></li>
        <li><a href="/analytics">Analytics</a></li>
        <li><a href="/account">Account</a></li>
      </Navigation>
    </SidebarWrapper>
  );
};

export default Sidebar;