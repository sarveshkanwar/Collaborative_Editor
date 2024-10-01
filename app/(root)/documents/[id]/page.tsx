// import React from 'react'
// // `import { Editor } from '@/components/editor/Editor'
// // import Header from '@/components/Header'
// // import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'`
// import CollaborativeRoom from '@/components/CollaborativeRoom'
// import { currentUser } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
// import { getDocument } from '@/lib/actions/room.actions';
// // import { getClerkUsers } from "@/lib/actions/user.actions";
// import { getClerkUsers } from './../../../../lib/actions/user.actions';



// const Document = async ({ params: { id } }: SearchParamProps) => {
//   const clerkUser = await currentUser();
//   if(!clerkUser) redirect('/sign-in');

//   const room = await getDocument({
//     roomId: id,
//     userId: clerkUser.emailAddresses[0].emailAddress,
//   });

//   if(!room) redirect('/');
//   return (
//    <main className="flex w-full flex-col">
//     const userIds=Object.keys(room.usersAccesses);

//     const user=await getClerkUsers({userIds});

//     const usersData = users.map((user: User) => ({
//     ...user,
//     userType: room.usersAccesses[user.email]?.includes('room:write')
//       ? 'editor'
//       : 'viewer'
//   }))

// const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';


// <CollaborativeRoom 
//         roomId={id}
//         roomMetadata={room.metadata}
//         users={usersData}
//         currentUserType={currentUserType}
//       />
//   </main>
//   )
// }

// export default Document
import CollaborativeRoom from '@/components/CollaborativeRoom';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getDocument } from '@/lib/actions/room.actions';
import { getClerkUsers } from './../../../../lib/actions/user.actions';

const Document = async ({ params: { id } }: SearchParamProps) => {
  // Get the current user
  const clerkUser = await currentUser();
  
  // Redirect if no user is found
  if (!clerkUser) {
    redirect('/sign-in');
    return;
  }

  // Fetch the room data
  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  // Redirect if no room is found
  if (!room) {
    redirect('/');
    return;
  }

  // Check if the required room metadata properties exist
  if (!room.metadata.creatorId || !room.metadata.email || !room.metadata.title) {
    console.error('Missing required metadata fields');
    redirect('/');
    return;
  }

  // Extract user IDs from the room's usersAccesses
  const userIds = Object.keys(room.usersAccesses);

  // Fetch user details from Clerk
  const users = await getClerkUsers({ userIds });

  // Filter out undefined users and map user details with their roles
  const usersData = users
    .filter((user): user is User => user !== undefined) // Ensure users array doesn't contain undefined
    .map((user: User) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes('room:write') 
        ? 'editor' as UserType
        : 'viewer' as UserType,
    }));

  // Determine the current user's type (editor or viewer)
  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write')
    ? 'editor' as UserType
    : 'viewer' as UserType;

  return (
    <main className="flex w-full flex-col">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
