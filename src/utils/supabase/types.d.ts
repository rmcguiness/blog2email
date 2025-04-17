export type Database = {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          url: string;
          feed_url: string;
          last_checked: string | null;
          last_post_date: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          url: string;
          feed_url: string;
          last_checked?: string | null;
          last_post_date?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          url?: string;
          feed_url?: string;
          last_checked?: string | null;
          last_post_date?: string | null;
          user_id?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          created_at: string;
          blog_id: string;
          title: string;
          description: string | null;
          url: string;
          published_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          blog_id: string;
          title: string;
          description?: string | null;
          url: string;
          published_at: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          blog_id?: string;
          title?: string;
          description?: string | null;
          url?: string;
          published_at?: string;
          sent_at?: string | null;
        };
      };
    };
  };
};

export type User = {
  id: string;
  email: string;
  phone: string;
};
