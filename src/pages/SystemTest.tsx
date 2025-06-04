
import SystemTestSuite from "@/components/testing/SystemTestSuite";

const SystemTest = () => {
  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">System Test Suite</h1>
          <p className="text-white/80">
            Comprehensive validation of all core features and data integrity
          </p>
        </div>
        
        <SystemTestSuite />
      </div>
    </div>
  );
};

export default SystemTest;
