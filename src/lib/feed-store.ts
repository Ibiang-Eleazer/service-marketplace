import { useSyncExternalStore } from "react";
import { seedPosts, type FeedPost } from "@/lib/feed-data";

type State = {
  posts: FeedPost[];
  savedIds: Set<string>;
  followedIds: Set<string>;
};

let state: State = {
  posts: seedPosts,
  savedIds: new Set<string>(),
  followedIds: new Set<string>(),
};

const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };

export const feedStore = {
  toggleLike(id: string) {
    state = {
      ...state,
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ),
    };
    emit();
  },
  toggleSave(id: string) {
    const saved = new Set(state.savedIds);
    if (saved.has(id)) saved.delete(id);
    else saved.add(id);
    state = { ...state, savedIds: saved };
    emit();
  },
  toggleFollow(authorId: string) {
    const followed = new Set(state.followedIds);
    if (followed.has(authorId)) followed.delete(authorId);
    else followed.add(authorId);
    state = {
      ...state,
      followedIds: followed,
      posts: state.posts.map((p) =>
        p.author.id === authorId ? { ...p, following: followed.has(authorId) } : p,
      ),
    };
    emit();
  },
  addPost(text: string, images?: { src: string; alt: string }[]) {
    const post: FeedPost = {
      id: `new-${Date.now()}`,
      author: {
        id: "me",
        name: "Chloe Adams",
        handle: "@chloeadams",
        initials: "CA",
        title: "Interior enthusiast",
        isProvider: false,
        area: "Ikoyi, Lagos",
      },
      text,
      images: images ?? [],
      time: "Just now",
      likes: 0,
      comments: 0,
      reposts: 0,
      intent: text.includes("?") ? "question" : text.includes("need") || text.includes("want") ? "need" : "idea",
    };
    state = { ...state, posts: [post, ...state.posts] };
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

function getSnapshot(): State {
  return state;
}

export function useFeed() {
  return useSyncExternalStore(feedStore.subscribe, getSnapshot, getSnapshot);
}

export function useSavedPosts() {
  const { posts, savedIds } = useFeed();
  return posts.filter((p) => savedIds.has(p.id));
}
