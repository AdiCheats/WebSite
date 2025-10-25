import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Settings, ArrowLeft, Users, Activity, Eye, EyeOff, MoreHorizontal, Trash2, Pause, Play, Key, Shield, Plus, UserPlus, Edit, UserCheck, UserX, Code, MessageSquare, Info, BarChart3, CheckCircle2, XCircle, Ban } from "lucide-react";
import Header from "@/components/header";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Application {
  id: number;
  userId: string;
  name: string;
  description: string;
  apiKey: string;
  version: string;
  isActive: boolean;
  hwidLockEnabled: boolean;
  loginSuccessMessage: string;
  loginFailedMessage: string;
  accountDisabledMessage: string;
  accountExpiredMessage: string;
  versionMismatchMessage: string;
  hwidMismatchMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface AppUser {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  isPaused: boolean;
  isBanned?: boolean;
  hwid?: string;
  ip?: string;
  expiresAt?: string;
  createdAt: string;
  lastLogin?: string;
  loginAttempts: number;
  lastLoginAttempt?: string;
}

interface LicenseKey {
  id: number;
  licenseKey: string;
  maxUsers: number;
  currentUsers: number;
  validityDays: number;
  expiresAt: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  registeredUsers: number;
  activeSessions: number;
  loginSuccessRate: number;
  totalApiRequests: number;
  lastActivity: string | null;
  applicationStatus: 'online' | 'offline';
  hwidLockEnabled: boolean;
}

interface CustomMessagesDto {
  loginSuccess: string;
  loginFailed: string;
  accountDisabled: string;
  accountExpired: string;
  versionMismatch: string;
  hwidMismatch: string;
}

export default function AppManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'licenses' | 'webhooks' | 'blacklist' | 'activity' | 'api' | 'messages'>('overview');
  const [isEditAppDialogOpen, setIsEditAppDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isCreateLicenseDialogOpen, setIsCreateLicenseDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [editAppData, setEditAppData] = useState<Partial<Application>>({});
  const [editUserData, setEditUserData] = useState<Partial<AppUser> & { password?: string }>({});
  const [createUserData, setCreateUserData] = useState({
    username: "",
    password: "",
    expiresAt: "",
    hwid: "",
    hwidLock: "false",
  });

  const [createLicenseData, setCreateLicenseData] = useState<{ licenseKey?: string; maxUsers: number; validityDays: number; description?: string; isActive: boolean }>({
    licenseKey: "",
    maxUsers: 1,
    validityDays: 30,
    description: "",
    isActive: true,
  });

  // Webhooks state
  const [newWebhook, setNewWebhook] = useState<{ url: string; events: string[]; isActive: boolean; secret?: string }>({
    url: "",
    events: ["user_login"],
    isActive: true,
    secret: "",
  });

  // Blacklist state
  const [newBlacklist, setNewBlacklist] = useState<{ type: 'ip' | 'username' | 'hwid'; value: string; reason?: string; isGlobal: boolean }>({
    type: 'ip',
    value: "",
    reason: "",
    isGlobal: false,
  });
  const [isAddBlacklistOpen, setIsAddBlacklistOpen] = useState(false);

  const appId = window.location.pathname.split('/')[2];

  const { data: application, isLoading: isLoadingApp } = useQuery<Application>({
    queryKey: [`/api/applications/${appId}`],
    enabled: !!appId,
    retry: 2,
    staleTime: 0,
  });

  const { data: appUsers = [], isLoading: isLoadingUsers } = useQuery<AppUser[]>({
    queryKey: [`/api/applications/${appId}/users`],
    enabled: !!appId,
  });

  const { data: appStats } = useQuery<AppStats>({
    queryKey: [`/api/applications/${appId}/stats`],
    enabled: !!appId,
  });

  const { data: licenseKeys = [] } = useQuery<LicenseKey[]>({
    queryKey: [`/api/applications/${appId}/licenses`],
    enabled: !!appId,
  });

  const { data: customMessages } = useQuery<CustomMessagesDto>({
    queryKey: ["/api/custom-messages"],
  });

  // Webhooks and Blacklist queries
  const { data: activityLogs = [] } = useQuery<any[]>({
    queryKey: [`/api/activity-logs?applicationId=${appId}`],
    enabled: !!appId,
  });

  // Webhooks and Blacklist queries
  const { data: webhooks = [] } = useQuery<any[]>({
    queryKey: ["/api/webhooks"],
  });

  const { data: blacklistEntries = [] } = useQuery<any[]>({
    queryKey: ["/api/blacklist"],
  });

  const [messagesEdit, setMessagesEdit] = useState<CustomMessagesDto | null>(null);

  const updateApplicationMutation = useMutation({
    mutationFn: (data: Partial<Application>) => 
      apiRequest(`/api/applications/${appId}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/stats`] });
      setIsEditAppDialogOpen(false);
      toast({ title: "Application updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update application", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/stats`] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    }
  });

  const pauseUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}/pause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "User paused successfully" });
    },
  });

  const unpauseUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}/unpause`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "User unpaused successfully" });
    },
  });

  const resetHwidMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}/reset-hwid`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "HWID reset successfully" });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}/ban`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "User banned successfully" });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId: number) => 
      apiRequest(`/api/applications/${appId}/users/${userId}/unban`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "User unbanned successfully" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => 
      apiRequest(`/api/applications/${appId}/users/${userId}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      toast({ title: "User updated successfully" });
      setIsEditUserDialogOpen(false);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => 
      apiRequest(`/api/applications/${appId}/users`, {
        method: 'POST',
        body: userData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/users`] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/stats`] });
      setIsCreateUserDialogOpen(false);
      setCreateUserData({
        username: "",
        password: "",
        expiresAt: "",
        hwid: "",
        hwidLock: application?.hwidLockEnabled ? "true" : "false"
      });
      toast({ title: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create user", description: error?.message || "Unknown error", variant: "destructive" });
    }
  });

  const createLicenseMutation = useMutation({
    mutationFn: (data: Partial<LicenseKey> & { maxUsers: number; validityDays: number }) =>
      apiRequest(`/api/applications/${appId}/licenses`, {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/licenses`] });
      setIsCreateLicenseDialogOpen(false);
      setCreateLicenseData({ licenseKey: "", maxUsers: 1, validityDays: 30, description: "", isActive: true });
      toast({ title: "License created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create license", description: error.message, variant: "destructive" });
    }
  });

  const updateMessagesMutation = useMutation({
    mutationFn: (payload: CustomMessagesDto) =>
      apiRequest(`/api/custom-messages`, { method: 'PUT', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-messages"] });
      toast({ title: "Messages updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update messages", description: error.message, variant: "destructive" });
    }
  });

  const resetMessagesMutation = useMutation({
    mutationFn: () => apiRequest(`/api/custom-messages/reset`, { method: 'POST' }),
    onSuccess: (data: CustomMessagesDto) => {
      setMessagesEdit(data);
      queryClient.invalidateQueries({ queryKey: ["/api/custom-messages"] });
      toast({ title: "Messages reset to defaults" });
    }
  });

  // Webhook mutations
  const createWebhookMutation = useMutation({
    mutationFn: (data: { url: string; events: string[]; isActive?: boolean; secret?: string }) =>
      apiRequest(`/api/webhooks`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setNewWebhook({ url: "", events: ["user_login"], isActive: true, secret: "" });
      toast({ title: "Webhook created" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create webhook", description: error.message, variant: "destructive" });
    }
  });

  const updateWebhookMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest(`/api/webhooks/${id}`, { method: 'PUT', body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Webhook updated" });
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/webhooks/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Webhook deleted" });
    }
  });

  // Blacklist mutations
  const createBlacklistMutation = useMutation({
    mutationFn: (payload: { applicationId?: number; type: 'ip' | 'username' | 'hwid'; value: string; reason?: string }) =>
      apiRequest(`/api/blacklist`, { method: 'POST', body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      setNewBlacklist({ type: 'ip', value: "", reason: "", isGlobal: false });
      setIsAddBlacklistOpen(false);
      toast({ title: "Blacklist entry added" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add blacklist entry", description: error.message, variant: "destructive" });
    }
  });

  const deleteBlacklistMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/blacklist/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      toast({ title: "Blacklist entry deleted" });
    }
  });

  const generateLicenseMutation = useMutation({
    mutationFn: async () =>
      apiRequest(`/api/applications/${appId}/licenses/generate`, { method: 'GET' }),
    onSuccess: (data: any) => {
      setCreateLicenseData(prev => ({
        ...prev,
        licenseKey: data.generatedKey,
        maxUsers: data.defaultMaxUsers ?? prev.maxUsers,
        validityDays: data.defaultValidityDays ?? prev.validityDays,
      }));
    },
  });

  const deleteLicenseMutation = useMutation({
    mutationFn: (licenseId: number) =>
      apiRequest(`/api/applications/${appId}/licenses/${licenseId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications/${appId}/licenses`] });
      toast({ title: "License deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete license", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (application) {
      setEditAppData(application);
      if (application.hwidLockEnabled) {
        setCreateUserData(prev => ({ ...prev, hwidLock: "true" }));
      }
    }
  }, [application]);

  useEffect(() => {
    if (customMessages && !messagesEdit) {
      setMessagesEdit(customMessages);
    }
  }, [customMessages, messagesEdit]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleUpdateApp = () => {
    const fields: (keyof Application | 'versionMismatchMessage' | 'loginSuccessMessage' | 'loginFailedMessage' | 'accountDisabledMessage' | 'accountExpiredMessage' | 'hwidMismatchMessage' | 'hwidLockEnabled')[] = [
      'name',
      'description',
      'isActive',
      'version',
      'versionMismatchMessage',
      'loginSuccessMessage',
      'loginFailedMessage',
      'accountDisabledMessage',
      'accountExpiredMessage',
      'hwidMismatchMessage',
      'hwidLockEnabled',
    ];

    const payload: any = {};
    for (const key of fields) {
      const value: any = (editAppData as any)[key];
      if (typeof value === 'boolean') {
        payload[key] = value;
      } else if (typeof value === 'string') {
        // Send strings as-is (Zod accepts empty string), but avoid undefined/null
        payload[key] = value;
      } else if (value !== null && value !== undefined) {
        payload[key] = value;
      }
    }

    // Remove any accidental nulls
    Object.keys(payload).forEach((k) => {
      if (payload[k] === null) delete payload[k];
    });

    updateApplicationMutation.mutate(payload);
  };

  const handleCreateUser = () => {
    if (!createUserData.username.trim() || !createUserData.password.trim()) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive"
      });
      return;
    }
    
    // Only send fields the backend expects; normalize values
    const userData: any = {
      username: createUserData.username.trim(),
      password: createUserData.password,
      expiresAt: createUserData.expiresAt?.trim() ? new Date(createUserData.expiresAt).toISOString() : undefined,
    };
    
    // Include HWID based on lock state
    if (createUserData.hwidLock === "true") {
      userData.hwid = ""; // indicates locked without value yet
    }
    
    // Never send client-only field
    delete (userData as any).hwidLock;

    createUserMutation.mutate(userData);
  };

  const handleEditUser = (user: AppUser) => {
    setEditUserData({
      ...user,
      password: "",
      expiresAt: user.expiresAt ? new Date(user.expiresAt).toISOString().slice(0, 16) : "",
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editUserData.username?.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }
    
    const userData: any = { ...editUserData };
    if (userData.expiresAt && typeof userData.expiresAt === 'string' && userData.expiresAt.trim()) {
      userData.expiresAt = new Date(userData.expiresAt).toISOString();
    } else if (userData.expiresAt === '') {
      userData.expiresAt = null;
    }
    
    if (!userData.password || !userData.password.trim()) {
      delete userData.password;
    }
    
    updateUserMutation.mutate({ userId: editUserData.id!, data: userData });
  };

  if (isLoadingApp) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading application...</div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Application not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top Bar with App Info and Actions */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-8 w-px bg-border" />
            <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">{application.name}</h1>
                  <Badge variant={application.isActive ? "default" : "secondary"} className="text-xs">
                  {application.isActive ? "Active" : "Inactive"}
                </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{application.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditAppDialogOpen} onOpenChange={setIsEditAppDialogOpen}>
              <DialogTrigger asChild>
                  <Button size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Application Settings</DialogTitle>
                    <DialogDescription>Configure your application</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Application Name</Label>
                      <Input
                        value={editAppData.name || ""}
                        onChange={(e) => setEditAppData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                        <Label>Version</Label>
                      <Input
                        value={editAppData.version || ""}
                        onChange={(e) => setEditAppData(prev => ({ ...prev, version: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                      <Label>Description</Label>
                    <Textarea
                      value={editAppData.description || ""}
                      onChange={(e) => setEditAppData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                    <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editAppData.isActive || false}
                      onCheckedChange={(checked) => setEditAppData(prev => ({ ...prev, isActive: checked }))}
                    />
                        <Label>Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editAppData.hwidLockEnabled || false}
                      onCheckedChange={(checked) => setEditAppData(prev => ({ ...prev, hwidLockEnabled: checked }))}
                    />
                        <Label>HWID Lock</Label>
                  </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditAppDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateApp} disabled={updateApplicationMutation.isPending}>
                      {updateApplicationMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
          </div>
        </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'users' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Users
                    <Badge variant="secondary" className="ml-auto text-xs">{appUsers.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('licenses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'licenses' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    Licenses
                    <Badge variant="secondary" className="ml-auto text-xs">{licenseKeys.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'activity' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    Activity
                    <Badge variant="secondary" className="ml-auto text-xs">{activityLogs.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('webhooks')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'webhooks' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Webhooks
                    <Badge variant="secondary" className="ml-auto text-xs">{webhooks.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('blacklist')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'blacklist' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Blacklist
                    <Badge variant="secondary" className="ml-auto text-xs">{blacklistEntries.length}</Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab('api')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'api' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    API Config
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'messages' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Application ID</p>
                      <p className="text-sm font-mono">{application.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
          {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
              <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                  <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                          <p className="text-3xl font-bold mt-2">{appStats?.totalUsers || appUsers.length}</p>
                  </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                  <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <p className="text-3xl font-bold mt-2 text-green-600">{appStats?.activeUsers || 0}</p>
                  </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                  <div>
                          <p className="text-sm font-medium text-muted-foreground">Live Sessions</p>
                          <p className="text-3xl font-bold mt-2 text-blue-600">{appStats?.activeSessions || 0}</p>
                  </div>
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                  <div>
                          <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                          <p className="text-3xl font-bold mt-2">{appStats?.loginSuccessRate || 0}%</p>
                  </div>
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Application Info and Security */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Application Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                  <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="text-sm font-medium mt-1">{application.name}</p>
                  </div>
                  <div>
                        <Label className="text-xs text-muted-foreground">Version</Label>
                        <p className="text-sm font-medium mt-1">{application.version}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm mt-1">{application.description || "No description"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">API Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                            {application.apiKey.substring(0, 12)}...
                          </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(application.apiKey)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <img
                          src="/logo.svg"
                          alt="ADI CHEATS Logo"
                          className="h-5 w-5 rounded-full shadow-lg"
                        />
                        Security Configuration
                      </CardTitle>
                </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm">Application Status</span>
                        <Badge variant={application.isActive ? "default" : "secondary"}>
                          {application.isActive ? "Online" : "Offline"}
                    </Badge>
                  </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm">HWID Protection</span>
                        <Badge variant={application.hwidLockEnabled ? "default" : "secondary"}>
                          {application.hwidLockEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm">API Requests</span>
                        <span className="text-sm font-medium">{appStats?.totalApiRequests || 0}</span>
                  </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm">Last Activity</span>
                        <span className="text-xs text-muted-foreground">
                          {appStats?.lastActivity ? new Date(appStats.lastActivity).toLocaleString() : "None"}
                        </span>
                  </div>
                </CardContent>
              </Card>
                  </div>
                  </div>
            )}

          {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-sm text-muted-foreground">Manage application users and permissions</p>
                  </div>
                  <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to your application</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Username *</Label>
                          <Input
                            value={createUserData.username}
                            onChange={(e) => setCreateUserData(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <Label>Password *</Label>
                          <Input
                            type="password"
                            value={createUserData.password}
                            onChange={(e) => setCreateUserData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter password"
                          />
                        </div>
                        <div>
                          <Label>Expires At</Label>
                          <div className="flex gap-2 mt-2 mb-2 flex-wrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const date = new Date();
                                  date.setDate(date.getDate() + 7);
                                  setCreateUserData(prev => ({ ...prev, expiresAt: date.toISOString().slice(0, 16) }));
                                }}
                              >
                                7 Days
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const date = new Date();
                                  date.setDate(date.getDate() + 30);
                                  setCreateUserData(prev => ({ ...prev, expiresAt: date.toISOString().slice(0, 16) }));
                                }}
                              >
                                30 Days
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const date = new Date();
                                  date.setFullYear(date.getFullYear() + 1);
                                  setCreateUserData(prev => ({ ...prev, expiresAt: date.toISOString().slice(0, 16) }));
                                }}
                              >
                                1 Year
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCreateUserData(prev => ({ ...prev, expiresAt: "9999-12-31T23:59" }));
                                }}
                              >
                                Never
                              </Button>
                            </div>
                            <Input
                              type="datetime-local"
                              value={createUserData.expiresAt}
                              onChange={(e) => setCreateUserData(prev => ({ ...prev, expiresAt: e.target.value }))}
                            />
                          </div>
                        </div>
                      <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                        </div>

                <Card>
                  <CardContent className="p-0">
                {isLoadingUsers ? (
                      <div className="text-center py-12">Loading users...</div>
                ) : appUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No users yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first user to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                        <TableHead>HWID</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appUsers.map((user: AppUser) => (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                                <div>
                                  <p className="font-medium">{user.username}</p>
                                  {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                              </div>
                          </TableCell>
                          <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge variant={user.isActive && !user.isPaused ? "default" : "secondary"} className="w-fit">
                                    {user.isPaused ? "Paused" : user.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  {user.isBanned && <Badge variant="destructive" className="w-fit text-xs">Banned</Badge>}
                              </div>
                              </TableCell>
                              <TableCell>
                                {user.hwid ? (
                                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                                    {user.hwid}
                                  </code>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                                <span className="text-sm">
                            {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : "Never"}
                                </span>
                          </TableCell>
                          <TableCell>
                                <span className="text-sm">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                                </span>
                          </TableCell>
                              <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => user.isPaused ? unpauseUserMutation.mutate(user.id) : pauseUserMutation.mutate(user.id)}
                                >
                                  {user.isPaused ? (
                                        <><Play className="h-4 w-4 mr-2" />Resume</>
                                  ) : (
                                        <><Pause className="h-4 w-4 mr-2" />Pause</>
                                  )}
                                </DropdownMenuItem>
                                    {user.hwid && (
                                  <DropdownMenuItem onClick={() => resetHwidMutation.mutate(user.id)}>
                                        <img
                                          src="/logo.svg"
                                          alt="ADI CHEATS Logo"
                                          className="h-4 w-4 rounded-full shadow-lg mr-2"
                                        />
                                        Reset HWID
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => user.isBanned ? unbanUserMutation.mutate(user.id) : banUserMutation.mutate(user.id)}
                                >
                                  {user.isBanned ? (
                                        <><UserCheck className="h-4 w-4 mr-2" />Unban</>
                                  ) : (
                                        <><UserX className="h-4 w-4 mr-2" />Ban</>
                                  )}
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete {user.username}? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteUserMutation.mutate(user.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

                {/* Edit User Dialog */}
                <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit User</DialogTitle>
                      <DialogDescription>Update user information</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={editUserData.username || ""}
                          onChange={(e) => setEditUserData(prev => ({ ...prev, username: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Password (leave empty to keep current)</Label>
                        <Input
                          type="password"
                          value={editUserData.password || ""}
                          onChange={(e) => setEditUserData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label>Expires At</Label>
                        <Input
                          type="datetime-local"
                          value={editUserData.expiresAt || ""}
                          onChange={(e) => setEditUserData(prev => ({ ...prev, expiresAt: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editUserData.isActive ?? true}
                            onCheckedChange={(checked) => setEditUserData(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label>Active</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editUserData.isPaused ?? false}
                            onCheckedChange={(checked) => setEditUserData(prev => ({ ...prev, isPaused: checked }))}
                          />
                          <Label>Paused</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Licenses Tab */}
            {activeTab === 'licenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">License Keys</h2>
                    <p className="text-sm text-muted-foreground">Manage license keys for user registration</p>
                  </div>
                  <Dialog open={isCreateLicenseDialogOpen} onOpenChange={setIsCreateLicenseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create License
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create License</DialogTitle>
                        <DialogDescription>Generate or enter a license key for this application</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>License Key</Label>
                          <div className="flex gap-2 mt-2">
                            <Input
                              value={createLicenseData.licenseKey || ""}
                              onChange={(e) => setCreateLicenseData(prev => ({ ...prev, licenseKey: e.target.value }))}
                              placeholder="Leave blank or generate"
                            />
                            <Button type="button" variant="outline" onClick={() => generateLicenseMutation.mutate()} disabled={generateLicenseMutation.isPending}>
                              {generateLicenseMutation.isPending ? 'Generating…' : 'Generate'}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Max Users</Label>
                            <Input
                              type="number"
                              value={createLicenseData.maxUsers}
                              onChange={(e) => setCreateLicenseData(prev => ({ ...prev, maxUsers: Math.max(1, Number(e.target.value || 1)) }))}
                              min={1}
                            />
                          </div>
                          <div>
                            <Label>Validity Days</Label>
                            <Input
                              type="number"
                              value={createLicenseData.validityDays}
                              onChange={(e) => setCreateLicenseData(prev => ({ ...prev, validityDays: Math.max(1, Number(e.target.value || 1)) }))}
                              min={1}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={createLicenseData.description || ""}
                            onChange={(e) => setCreateLicenseData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={createLicenseData.isActive}
                            onCheckedChange={(checked) => setCreateLicenseData(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateLicenseDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => createLicenseMutation.mutate({
                          licenseKey: createLicenseData.licenseKey?.trim() ? createLicenseData.licenseKey : undefined,
                          maxUsers: createLicenseData.maxUsers,
                          validityDays: createLicenseData.validityDays,
                          description: createLicenseData.description?.trim() ? createLicenseData.description : undefined,
                          isActive: createLicenseData.isActive,
                        })} disabled={createLicenseMutation.isPending}>
                          {createLicenseMutation.isPending ? 'Creating…' : 'Create License'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {licenseKeys.length === 0 ? (
                      <div className="text-center py-12">
                        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No license keys</h3>
                        <p className="text-muted-foreground mb-4">Create license keys to allow users to register</p>
                        <Button onClick={() => setIsCreateLicenseDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create License
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>License Key</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Validity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {licenseKeys.map((license) => (
                            <TableRow key={license.id} className="hover:bg-muted/50">
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {license.licenseKey.substring(0, 16)}...
                                </code>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {license.currentUsers} / {license.maxUsers}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{license.validityDays} days</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant={license.isActive && new Date(license.expiresAt) > new Date() ? "default" : "secondary"}>
                                  {license.isActive && new Date(license.expiresAt) > new Date() ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {new Date(license.expiresAt).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {new Date(license.createdAt).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete License</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove the license key.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteLicenseMutation.mutate(license.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Activity Logs</h2>
                    <p className="text-sm text-muted-foreground">Recent events for this application</p>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {(!activityLogs || activityLogs.length === 0) ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No activity yet</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>User Agent</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activityLogs.map((log: any) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-xs">{new Date(log.createdAt).toLocaleString()}</TableCell>
                              <TableCell className="text-xs font-mono">{log.event}</TableCell>
                              <TableCell>{log.success ? <Badge>Success</Badge> : <Badge variant="secondary">Fail</Badge>}</TableCell>
                              <TableCell className="text-xs">{log.ipAddress || '-'}</TableCell>
                              <TableCell className="text-xs truncate max-w-[240px]">{log.userAgent || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Webhooks</h2>
                    <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Create Webhook</CardTitle>
                    <CardDescription>Enter a URL and select events to subscribe to</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Webhook URL</Label>
                      <Input value={newWebhook.url} onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div>
                      <Label>Events</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {[
                          'user_login','login_failed','user_registration','account_disabled','account_expired','version_mismatch','hwid_mismatch','login_blocked_ip','login_blocked_username','login_blocked_hwid','session_start','session_end'
                        ].map(evt => (
                          <label key={evt} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={newWebhook.events.includes(evt)}
                              onCheckedChange={(checked) => setNewWebhook(prev => ({ ...prev, events: checked ? Array.from(new Set([...(prev.events||[]), evt])) : (prev.events||[]).filter(e => e !== evt) }))}
                            />
                            <span className="capitalize">{evt.replaceAll('_',' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch checked={newWebhook.isActive} onCheckedChange={(checked) => setNewWebhook(prev => ({ ...prev, isActive: checked }))} />
                        <Label>Active</Label>
                      </div>
                      <div className="flex-1">
                        <Label>Secret (optional)</Label>
                        <Input value={newWebhook.secret || ''} onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))} />
                      </div>
                    </div>
                    <Button onClick={() => createWebhookMutation.mutate({ url: newWebhook.url, events: newWebhook.events, isActive: newWebhook.isActive, secret: newWebhook.secret?.trim() ? newWebhook.secret : undefined })} disabled={createWebhookMutation.isPending}>
                      {createWebhookMutation.isPending ? 'Creating…' : 'Create Webhook'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Existing Webhooks</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {webhooks.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No webhooks yet</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Events</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhooks.map((wh: any) => (
                            <TableRow key={wh.id}>
                              <TableCell className="max-w-[280px] truncate">{wh.url}</TableCell>
                              <TableCell className="text-xs">{Array.isArray(wh.events) ? wh.events.join(', ') : ''}</TableCell>
                              <TableCell>{wh.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="outline" onClick={() => updateWebhookMutation.mutate({ id: wh.id, updates: { isActive: !wh.isActive } })}>
                                    {wh.isActive ? 'Disable' : 'Enable'}
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">Delete</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently remove the webhook.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteWebhookMutation.mutate(wh.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Blacklist Tab */}
            {activeTab === 'blacklist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Blacklist</h2>
                    <p className="text-sm text-muted-foreground">Block IPs, usernames, or HWIDs</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Dialog open={isAddBlacklistOpen} onOpenChange={setIsAddBlacklistOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        Add to Blacklist
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Blacklist Entry</DialogTitle>
                        <DialogDescription>Select the type and provide details to block.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-3">
                            <Label>Type</Label>
                            <Select value={newBlacklist.type} onValueChange={(v) => setNewBlacklist(prev => ({ ...prev, type: v as any }))}>
                              <SelectTrigger className="mt-2"><SelectValue placeholder="Select type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ip">IP</SelectItem>
                                <SelectItem value="username">Username</SelectItem>
                                <SelectItem value="hwid">HWID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-3">
                            <Label>Data</Label>
                            <Input className="mt-2" value={newBlacklist.value} onChange={(e) => setNewBlacklist(prev => ({ ...prev, value: e.target.value }))} placeholder="IP / Username / HWID" />
                          </div>
                          <div className="col-span-3">
                            <Label>Reason (optional)</Label>
                            <Input className="mt-2" value={newBlacklist.reason || ''} onChange={(e) => setNewBlacklist(prev => ({ ...prev, reason: e.target.value }))} placeholder="Why is this being blacklisted?" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox checked={newBlacklist.isGlobal} onCheckedChange={(checked) => setNewBlacklist(prev => ({ ...prev, isGlobal: !!checked }))} />
                          <Label>Global (applies to all applications)</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddBlacklistOpen(false)}>Cancel</Button>
                        <Button onClick={() => createBlacklistMutation.mutate({
                          applicationId: newBlacklist.isGlobal ? undefined : Number(appId),
                          type: newBlacklist.type,
                          value: newBlacklist.value,
                          reason: newBlacklist.reason?.trim() ? newBlacklist.reason : undefined,
                        })} disabled={createBlacklistMutation.isPending || !newBlacklist.value.trim()}>
                          {createBlacklistMutation.isPending ? 'Blacklisting…' : 'Add to Blacklist'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Entries</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {blacklistEntries.length === 0 ? (
                      <div className="text-center py-12 text-sm text-muted-foreground">No blacklist entries</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {blacklistEntries.map((entry: any) => (
                            <TableRow key={entry.id}>
                              <TableCell className="capitalize">{entry.type}</TableCell>
                              <TableCell className="font-mono text-xs">{entry.value}</TableCell>
                              <TableCell className="text-xs">{entry.reason || '-'}</TableCell>
                              <TableCell>{entry.applicationId ? `App ${entry.applicationId}` : 'Global'}</TableCell>
                              <TableCell className="text-right">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                      <AlertDialogDescription>This will remove the blacklist entry.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteBlacklistMutation.mutate(entry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* API Config Tab */}
            {activeTab === 'api' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">API Configuration</h2>
                  <p className="text-sm text-muted-foreground">Integration endpoints and credentials</p>
                </div>

            <Card>
              <CardHeader>
                    <CardTitle>API Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex gap-2 mt-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={application.apiKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(application.apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Base URL</Label>
                      <Input value={`${window.location.origin}/api/auth`} readOnly className="mt-2" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Login Endpoint</Label>
                      <Input value={`${window.location.origin}/api/auth/login`} readOnly className="mt-2" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Register Endpoint</Label>
                      <Input value={`${window.location.origin}/api/auth/register`} readOnly className="mt-2" />
                </div>
              </CardContent>
            </Card>
              </div>
            )}

          {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Custom Messages</h2>
                    <p className="text-sm text-muted-foreground">Configure authentication response messages</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => resetMessagesMutation.mutate()} disabled={resetMessagesMutation.isPending}>
                      {resetMessagesMutation.isPending ? 'Resetting…' : 'Reset to Defaults'}
                    </Button>
                    <Button onClick={() => messagesEdit && updateMessagesMutation.mutate(messagesEdit)} disabled={updateMessagesMutation.isPending || !messagesEdit}>
                      {updateMessagesMutation.isPending ? 'Saving…' : 'Save Messages'}
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Login Success
                      </Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.loginSuccess || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), loginSuccess: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Login Failed
                      </Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.loginFailed || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), loginFailed: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Disabled</Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.accountDisabled || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), accountDisabled: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Expired</Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.accountExpired || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), accountExpired: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version Mismatch</Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.versionMismatch || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), versionMismatch: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">HWID Mismatch</Label>
                      <Input
                        className="mt-2"
                        value={messagesEdit?.hwidMismatch || ""}
                        onChange={(e) => setMessagesEdit(prev => ({ ...(prev || (customMessages || { loginSuccess: '', loginFailed: '', accountDisabled: '', accountExpired: '', versionMismatch: '', hwidMismatch: '' })), hwidMismatch: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
