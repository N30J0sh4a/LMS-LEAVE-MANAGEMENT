import {
  createFileRoute,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  getUserProfile,
  clearUserProfile,
  saveUserProfile,
} from "../../lib/session";
import { loginUserSession, type UserProfile } from "@/lib/auth-api";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Building, CalendarDays, Clock3, LogIn, MailIcon, PanelLeft, Plus, ShieldCheck, User2, User2Icon, UserIcon, Users2Icon, UsersIcon, Workflow, WorkflowIcon } from "lucide-react";

export const Route = createFileRoute("/user-profile/")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      return;
    }
    const profile = getUserProfile();
    if (!profile || profile.role !== "employee") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile());
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = "Your profile";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearUserProfile();
        setUser(null);
        setLoadingProfile(false);
        await navigate({ to: "/" });
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const profile = await loginUserSession(idToken, {
          role: "employee",
          autoCreate: false,
        });

        saveUserProfile(profile);
        setUser(profile);
      } catch {
        clearUserProfile();
        setUser(null);
        await navigate({ to: "/" });
      } finally {
        setLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    clearUserProfile();
    await navigate({ to: "/" });
  };

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [currentTime],
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime],
  );

  const initials = useMemo(() => {
      if (!user?.fullName) {
        return 'U'
      }
      return user.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    }, [user?.fullName])


  if (loadingProfile || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F4F6F9]">
        <p className="text-sm text-[#2D3142]">Loading your workspace...</p>
      </main>
    );
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          userName={user.fullName}
          userEmail={user.email}
          role={user.role}
          currentPath="/user-profile"
          onLogout={handleLogout}
        />

        <section className="w-screen h-screen flex flex-col flex-1 p-0 bg-[#F4F6F9]">
          <div className="w-full relative overflow-hidden border-b border-[#E6E8EC] bg-linear-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F26327_0%,transparent_40%)] opacity-25" />
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 md:px-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <PanelLeft className="h-4 w-4" />
                  </SidebarTrigger>
                  <div className="grid size-12 place-items-center rounded-xl bg-white/15 text-sm font-semibold text-white backdrop-blur-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm text-[#D6D9E0]">Employee</p>
                    <h1 className="text-2xl font-semibold text-white md:text-3xl">
                      Your profile
                    </h1>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-sm text-[#E4E8F0]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {formattedTime}
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Secure session active
                </div>
              </div>
            </div>
          </div>

          {/**Content */}
          <Card className="mx-[11.5dvw] my-[5dvh] flex flex-1 flex-col h-full w-auto p-0 rounded-xl">
            <CardContent className="flex flex-1 w-full h-full p-0">
              <div className="flex flex-1 flex-col w-full h-full px-5 py-5 text-center border-r">
                <div className="flex flex-0 p-5 text-center w-fit h-fit rounded-2xl bg-stone-950/35 text-xl font-semibold text-white self-center">
                  {initials}
                </div>

                <div className="flex flex-1 flex-col text-center mt-5 gap-1">
                  <p className="font-semibold text-xl">{user.fullName}</p>
                  <div className="flex flex-0 flex-row gap-2 justify-center content-center">
                    <Users2Icon className="inline-block text-light w-4 h-auto text-[#1A5FD7]" />
                    <p className="uppercase h-auto text-[0.9rem] font-normal text-stone-500 content-center">
                      {user.role}
                    </p>
                  </div>
                  <div className="flex flex-0 flex-row gap-2 justify-center content-center">
                    <Building className="inline-block text-light w-4 h-auto text-[#1A5FD7]" />
                    <p className="uppercase h-auto text-[0.9rem] font-normal text-stone-500 content-center">
                      IT Department
                    </p>
                  </div>
                  <div className="flex flex-0 flex-row gap-2 justify-center content-center">
                    <WorkflowIcon className="inline-block text-light w-4 h-auto text-[#1A5FD7]" />
                    <p className="uppercase h-auto text-[0.9rem] font-normal text-stone-500 content-center">
                      Software Engineer
                    </p>
                  </div>

                  <div className="flex flex-4 h-auto w-full" />

                  <div className="flex flex-1 flex-col border-t">
                    <div className="flex flex-1 flex-col my-2">
                      <p className="font-normal text-[0.7rem]">
                        Account creation date
                      </p>
                      <div className=" flex flex-1 flex-row gap-3 justify-center text-[0.8]">
                        <Plus className="h-auto w-4 text-[#1A5FD7]" />
                        <span className="font-light">
                          {new Date(user.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col my-2">
                      <p className="font-normal text-[0.7rem]">
                        Account last login
                      </p>

                      <div className=" flex flex-1 flex-row gap-3 justify-center text-[0.8]">
                        <LogIn className="h-auto w-4 text-[#1A5FD7]" />
                        <span className="font-light">
                          {new Date(user.lastLoginAt).toLocaleString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-2 flex-col w-full h-full px-10 py-5">
                <h1 className="flex flex-0 text-[1.2rem] font-semibold text-black my-2 border-b">
                  PERSONAL INFORMATION
                </h1>

                <div className="flex flex-1 flex-col">
                  <div className="grid grid-cols-5 grid-rows-3 gap-2 mt-2">
                    <div className="flex col-span-2 text-[1rem] gap-2">
                      <User2 className="w-4 text-[#1A5FD7]" />
                      <p className="font-light">Full name</p>
                    </div>
                    <div className="flex col-span-3 col-start-3 text-[1rem] text-stone-600">
                      <p className="normal-case font-normal">{user.fullName}</p>
                    </div>
                    <div className=" flex col-span-2 row-start-2 text-[1rem] gap-2">
                      <MailIcon className="w-4 text-[#1A5FD7]" />
                      <p className="font-light">Email address</p>
                    </div>
                    <div className=" flex col-span-3 col-start-3 row-start-2 text-stone-600">
                      <p className="normal-case font-normal">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-4 flex-col">
                  <h1 className="flex flex-0 text-[1.2rem] font-semibold text-black my-2 border-b">
                    ORGANIZATIONAL INFORMATION
                  </h1>

                  <div className="grid grid-cols-5 grid-rows-3 gap-2 mt-2">
                    <div className="flex col-span-2 text-[1rem] gap-2">
                      <User2Icon className="w-4 text-[#1A5FD7]" />
                      <p className="font-light">Role</p>
                    </div>
                    <div className="flex col-span-3 col-start-3 text-[1rem] text-stone-600">
                      <p className="capitalize font-normal">{user.role}</p>
                    </div>
                    <div className=" flex col-span-2 row-start-2 text-[1rem] gap-2">
                      <Building className="w-4 text-[#1A5FD7]" />
                      <p className="font-light">Department</p>
                    </div>
                    <div className=" flex col-span-3 col-start-3 row-start-2 text-stone-600">
                      <p className="normal-case font-normal">IT Department</p>
                    </div>
                    <div className=" flex col-span-2 row-start-3 text-[1rem] gap-2">
                      <Workflow className="w-4 text-[#1A5FD7]" />
                      <p className="font-light">Position</p>
                    </div>
                    <div className=" flex col-span-2 col-start-3 row-start-3 text-stone-600">
                      <p className="normal-case font-normal">
                        Software Engineer
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </section>
      </SidebarProvider>
    </>
  );
}
