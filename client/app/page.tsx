import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/app/components/ui/button"; // Correct alias
import { LogIn } from "lucide-react";
import FileUpload from "@/app/components/file-upload"; // Correct alias
import ChatComponent from "@/app/components/chat"; // Correct alias

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      {isAuth ? (
        // USER IS LOGGED IN: Show the dashboard
        <div className="flex h-full">
          <div className="w-1/3 min-h-screen p-4 flex justify-center items-center border-r-2">
            <FileUpload />
          </div>
          <div className="w-2/3 min-h-screen">
            <ChatComponent />
          </div>
        </div>
      ) : (
        // USER IS LOGGED OUT: Show the landing page
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <p className="max-w-xl mt-2 text-lg text-slate-600">
              Join millions to instantly answer questions and understand research with AI.
            </p>
            <div className="w-full mt-4">
              <Link href="/sign-in">
                <Button>
                  Login to get Started!
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}