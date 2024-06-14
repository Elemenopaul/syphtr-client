import { CreateOrganization } from "@clerk/nextjs";
import Link from 'next/link';
import { UserButton } from '@clerk/clerk-react';

export default function CreateOrganizationPage() {
    return (
        <div className="flex flex-col">
            <header className="bg-green-400 text-white p-4 mb-4 w-full flex justify-between items-center">
      <Link href="/" passHref>
        <h1 className="text-sm font-bold cursor-pointer">
          <img src="/logos/Color logo - no background.png" alt="Syphtr" className="w-40 h-auto" />
        </h1>
      </Link>
      <div className="flex space-x-4">
        <Link href="/DbSearchForm" passHref><span className="text--white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Search for Candidates</span></Link>
        <Link href="/jobspage" passHref><span className="text-white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Your Jobs</span></Link>
        <Link href="/ProxyCurlSearchForm" passHref><span className="text-white font-bold hover:text-green-500 transition duration-300 ease-in-out cursor-pointer">Proxy Curl Search Form</span></Link>
        <Link href="/create-organization/" passHref><span className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer">Create Organization</span></Link>
        <Link href="/organization-profile/" passHref><span className="text-white font-bold hover:text-blue-500 transition duration-300 ease-in-out cursor-pointer">Your Organization Profile</span></Link>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
      <CreateOrganization routing="path" path="/create-organization" />
    </div>
  )
}