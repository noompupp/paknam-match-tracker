
import React from 'react';
import StickyBackground from "@/components/shared/StickyBackground";
import TabsRenderer from "./TabsRenderer";
import { refereeTabItems } from '../navigation/refereeTabsConfig';

const TabsContainer = () => {
  return (
    <StickyBackground variant="navigation" className="mb-6">
      <TabsRenderer 
        tabs={refereeTabItems}
        className="bg-transparent"
      />
    </StickyBackground>
  );
};

export default TabsContainer;
