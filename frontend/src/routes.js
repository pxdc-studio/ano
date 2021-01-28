import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import MainLayout from 'src/layouts/MainLayout';
import AccountView from 'src/views/account/AccountView';
import AnnouncementBySubscription from 'src/views/announcement/by.subscription';
import AnnouncementByPersonal from 'src/views/announcement/by.personal';

import AnnouncementForm from 'src/views/announcement/form.crud';
// import DashboardView from 'src/views/reports/DashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
import ProductListView from 'src/views/product/ProductListView';
import RegisterView from 'src/views/auth/RegisterView';
import SettingsView from 'src/views/settings/SettingsView';
import Resources from 'src/views/resources/index';
import Tags from 'src/views/tags';
import Synomyms from 'src/views/synonyms';
import ResourceForm from 'src/views/resourcesForm';
import TagForm from 'src/views/tagForm';
import SynonymForm from 'src/views/synonymForm';
import Subscriptions from 'src/views/subscriptions';
import SubscriptionForm from 'src/views/subscriptionForm';

function getAuthenticationData() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
}

const routes = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'account', element: <AccountView /> },
      { path: 'add-subscriptions/:id', element: <SubscriptionForm /> },
      { path: 'subscriptions', element: <Subscriptions /> },
      { path: 'synonyms', element: <Synomyms /> },
      { path: 'add-synonyms/:id', element: <SynonymForm /> },
      { path: 'tags', element: <Tags /> },
      { path: 'add-tags/:id', element: <TagForm /> },
      { path: 'resources', element: <Resources /> },
      { path: 'resources/add', element: <ResourceForm action="create" /> },
      { path: 'announcements', element: <AnnouncementBySubscription auth={getAuthenticationData()} /> },
      { path: 'announcements/me', element: <AnnouncementByPersonal auth={getAuthenticationData()} /> },
      { path: 'announcements/add', element: <AnnouncementForm action="create" /> },
      { path: 'announcements/update/:id', element: <AnnouncementForm action="update" /> },
      // { path: 'dashboard', element: <DashboardView /> },
      { path: 'products', element: <ProductListView /> },
      { path: 'settings', element: <SettingsView /> },
      {
        path: '/',
        element: localStorage.getItem('x-auth-token') ? <Navigate to="/announcements" /> : <Navigate to="/login" />
      },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: 'register', element: <RegisterView /> },
      { path: '404', element: <NotFoundView /> },
      {
        path: '/',
        element: localStorage.getItem('x-auth-token') ? <Navigate to="/announcements" /> : <Navigate to="/login" />
      },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
