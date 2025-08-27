// app/api/liveblocks-auth/route.ts
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || "sk_dev_your_secret_key_here",
});

// Generate random user data for demo purposes
function generateUser() {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: userId,
    name: randomName,
    color: randomColor,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`, // Optional avatar
  };
}

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get the user from your auth system
    // For now, we'll generate a random user for demo purposes
    const user = generateUser();

    // Create a session for the user
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        id: user.id,
        name: user.name,
        color: user.color,
        avatar: user.avatar,
      },
    });

    // Give the user access to the room
    // In a real app, you'd implement proper authorization logic here
    session.allow("*", session.FULL_ACCESS);

    // Authorize the user and return the result
    const { body, status } = await session.authorize();
    return new Response(body, { status });
    
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}