
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RefereeToolsValidator } from "./RefereeToolsValidator";
import { DataIntegrityValidator } from "./DataIntegrityValidator";
import { CrossComponentValidator } from "./CrossComponentValidator";
import { ErrorAnalyzer } from "./ErrorAnalyzer";

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
  duration?: number;
  error?: Error;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
  progress: number;
}

const SystemTestSuite = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Referee Tools Core Functions',
      tests: [],
      status: 'pending',
      progress: 0
    },
    {
      name: 'Data Integrity & Synchronization',
      tests: [],
      status: 'pending',
      progress: 0
    },
    {
      name: 'Cross-Component Validation',
      tests: [],
      status: 'pending',
      progress: 0
    },
    {
      name: 'Error Handling & Recovery',
      tests: [],
      status: 'pending',
      progress: 0
    }
  ]);

  const refereeValidator = new RefereeToolsValidator();
  const dataValidator = new DataIntegrityValidator();
  const crossComponentValidator = new CrossComponentValidator();
  const errorAnalyzer = new ErrorAnalyzer();

  const runSystemTests = async () => {
    setIsRunning(true);
    
    try {
      console.log('🚀 SystemTestSuite: Starting comprehensive system test...');
      
      toast({
        title: "System Test Started",
        description: "Running comprehensive validation of all core features...",
      });

      // Test Suite 1: Referee Tools Core Functions
      await runTestSuite(0, 'Referee Tools Core Functions', async () => {
        const tests: TestResult[] = [];
        
        // Test 1: Match Selection and Timer
        tests.push(await runTest('match-timer', 'Match Selection and Timer', async () => {
          return await refereeValidator.validateMatchTimer();
        }));

        // Test 2: Score Management
        tests.push(await runTest('score-management', 'Score Management', async () => {
          return await refereeValidator.validateScoreManagement();
        }));

        // Test 3: Goal Assignment Flow
        tests.push(await runTest('goal-assignment', 'Goal Assignment Flow', async () => {
          return await refereeValidator.validateGoalAssignment();
        }));

        // Test 4: Card Management
        tests.push(await runTest('card-management', 'Card Management', async () => {
          return await refereeValidator.validateCardManagement();
        }));

        // Test 5: Player Time Tracking
        tests.push(await runTest('time-tracking', 'Player Time Tracking', async () => {
          return await refereeValidator.validatePlayerTimeTracking();
        }));

        // Test 6: Match Save Functionality
        tests.push(await runTest('match-save', 'Match Save Functionality', async () => {
          return await refereeValidator.validateMatchSave();
        }));

        return tests;
      });

      // Test Suite 2: Data Integrity & Synchronization
      await runTestSuite(1, 'Data Integrity & Synchronization', async () => {
        const tests: TestResult[] = [];

        // Test 1: Database Consistency
        tests.push(await runTest('db-consistency', 'Database Consistency Check', async () => {
          return await dataValidator.validateDatabaseConsistency();
        }));

        // Test 2: Team ID Mapping
        tests.push(await runTest('team-mapping', 'Team ID Mapping Validation', async () => {
          return await dataValidator.validateTeamIdMapping();
        }));

        // Test 3: Player Statistics Sync
        tests.push(await runTest('stats-sync', 'Player Statistics Synchronization', async () => {
          return await dataValidator.validatePlayerStatsSync();
        }));

        // Test 4: Duplicate Prevention
        tests.push(await runTest('duplicate-prevention', 'Duplicate Event Prevention', async () => {
          return await dataValidator.validateDuplicatePrevention();
        }));

        // Test 5: Match Events Integrity
        tests.push(await runTest('events-integrity', 'Match Events Data Integrity', async () => {
          return await dataValidator.validateMatchEventsIntegrity();
        }));

        return tests;
      });

      // Test Suite 3: Cross-Component Validation
      await runTestSuite(2, 'Cross-Component Validation', async () => {
        const tests: TestResult[] = [];

        // Test 1: Match Summary Display
        tests.push(await runTest('match-summary', 'Match Summary Data Display', async () => {
          return await crossComponentValidator.validateMatchSummary();
        }));

        // Test 2: Team Squad Integration
        tests.push(await runTest('team-squad', 'Team Squad Data Integration', async () => {
          return await crossComponentValidator.validateTeamSquad();
        }));

        // Test 3: Dashboard Widgets
        tests.push(await runTest('dashboard-widgets', 'Dashboard Widget Data', async () => {
          return await crossComponentValidator.validateDashboardWidgets();
        }));

        // Test 4: Player Stats Consistency
        tests.push(await runTest('player-stats', 'Player Statistics Consistency', async () => {
          return await crossComponentValidator.validatePlayerStatsConsistency();
        }));

        // Test 5: Real-time Updates
        tests.push(await runTest('realtime-updates', 'Real-time Data Updates', async () => {
          return await crossComponentValidator.validateRealtimeUpdates();
        }));

        return tests;
      });

      // Test Suite 4: Error Handling & Recovery
      await runTestSuite(3, 'Error Handling & Recovery', async () => {
        const tests: TestResult[] = [];

        // Test 1: Network Error Handling
        tests.push(await runTest('network-errors', 'Network Error Handling', async () => {
          return await errorAnalyzer.testNetworkErrorRecovery();
        }));

        // Test 2: Data Validation Errors
        tests.push(await runTest('validation-errors', 'Data Validation Error Handling', async () => {
          return await errorAnalyzer.testDataValidationErrors();
        }));

        // Test 3: Concurrent Operations
        tests.push(await runTest('concurrent-ops', 'Concurrent Operations Handling', async () => {
          return await errorAnalyzer.testConcurrentOperations();
        }));

        // Test 4: Recovery Mechanisms
        tests.push(await runTest('recovery', 'Recovery Mechanisms', async () => {
          return await errorAnalyzer.testRecoveryMechanisms();
        }));

        return tests;
      });

      console.log('✅ SystemTestSuite: All test suites completed');
      
      toast({
        title: "System Test Completed",
        description: "All test suites have been executed. Check results for any issues.",
      });

    } catch (error) {
      console.error('❌ SystemTestSuite: Critical error during testing:', error);
      
      toast({
        title: "System Test Failed",
        description: "Critical error occurred during testing. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runTestSuite = async (
    suiteIndex: number, 
    suiteName: string, 
    testRunner: () => Promise<TestResult[]>
  ) => {
    console.log(`🧪 Running test suite: ${suiteName}`);
    
    setTestSuites(prev => prev.map((suite, index) => 
      index === suiteIndex 
        ? { ...suite, status: 'running', progress: 0 }
        : suite
    ));

    try {
      const tests = await testRunner();
      
      setTestSuites(prev => prev.map((suite, index) => 
        index === suiteIndex 
          ? { 
              ...suite, 
              tests, 
              status: 'completed', 
              progress: 100 
            }
          : suite
      ));

      console.log(`✅ Test suite completed: ${suiteName}`);
    } catch (error) {
      console.error(`❌ Test suite failed: ${suiteName}`, error);
      
      setTestSuites(prev => prev.map((suite, index) => 
        index === suiteIndex 
          ? { 
              ...suite, 
              status: 'completed', 
              progress: 100,
              tests: [{
                id: 'suite-error',
                name: 'Suite Execution Error',
                status: 'failed',
                message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error: error instanceof Error ? error : new Error(String(error))
              }]
            }
          : suite
      ));
    }
  };

  const runTest = async (
    testId: string, 
    testName: string, 
    testFunction: () => Promise<any>
  ): Promise<TestResult> => {
    setCurrentTest(testName);
    console.log(`🔍 Running test: ${testName}`);
    
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Test passed: ${testName} (${duration}ms)`);
      
      return {
        id: testId,
        name: testName,
        status: result.warnings?.length > 0 ? 'warning' : 'passed',
        message: result.message || 'Test passed successfully',
        details: result.details,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`❌ Test failed: ${testName}`, error);
      
      return {
        id: testId,
        name: testName,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Test failed with unknown error',
        duration,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetTests = () => {
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: [],
      status: 'pending',
      progress: 0
    })));
    setCurrentTest(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            System Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runSystemTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run System Tests'}
            </Button>
            
            <Button 
              onClick={resetTests} 
              variant="outline"
              disabled={isRunning}
            >
              Reset Tests
            </Button>
          </div>

          {currentTest && (
            <Alert className="mb-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Currently running: {currentTest}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {testSuites.map((suite, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{suite.name}</CardTitle>
                    <Badge className={getStatusColor(suite.status)}>
                      {suite.status}
                    </Badge>
                  </div>
                  {suite.status === 'running' && (
                    <Progress value={suite.progress} className="mt-2" />
                  )}
                </CardHeader>
                
                {suite.tests.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      {suite.tests.map((test) => (
                        <div 
                          key={test.id} 
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {test.message}
                              </div>
                              {test.duration && (
                                <div className="text-xs text-muted-foreground">
                                  Duration: {test.duration}ms
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemTestSuite;
