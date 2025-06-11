
import React from 'react';
import StickyBackground from "@/components/shared/StickyBackground";
import ResponsiveTabsList from "../shared/ResponsiveTabsList";
import { refereeTabItems } from './refereeTabsConfig';

const RefereeTabsNavigationContainer = () => {
  return (
    <StickyBackground variant="navigation" className="mb-6">
      <ResponsiveTabsList 
        tabs={refereeTabItems}
        className="bg-transparent"
      />
    </StickyBackground>
  );
};

export default RefereeTabsNavigationContainer;
