
import { Bell, Shield, Users, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Notifications = () => {
  return (
    <div className="min-h-screen gradient-bg pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="text-center text-white space-y-4">
          <Shield className="h-16 w-16 mx-auto text-white/80" />
          <h1 className="text-3xl font-bold">Enhanced Features</h1>
          <p className="text-white/80 max-w-md mx-auto">
            Access advanced notifications and enhanced features for a better experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/10 border-white/20 text-white dark:bg-white/5 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Real-time Notifications
              </CardTitle>
              <CardDescription className="text-white/70 dark:text-white/60">
                Get instant updates on match events and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 dark:text-white/50">
                Stay informed with live match notifications, goal alerts, and card updates.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white dark:bg-white/5 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription className="text-white/70 dark:text-white/60">
                Advanced team and player management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 dark:text-white/50">
                Enhanced features for managing team rosters and player statistics.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white dark:bg-white/5 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-white/70 dark:text-white/60">
                Detailed match and performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 dark:text-white/50">
                Access comprehensive statistics and performance insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
