"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlaylistSection } from "@/components/music/playlist-section";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const DiscoverCard = memo(({ title, description, link, count, isLoading, onClick }) => {
  return (
    <Link href={link} className="group">
      <div
        onClick={onClick}
        className="rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-200 p-4 cursor-pointer h-full flex flex-col justify-between"
      >
        <div>
          <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-1 group-hover:text-primary">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        {!isLoading && count !== undefined && (
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            {count} items
          </p>
        )}
      </div>
    </Link>
  );
});

DiscoverCard.displayName = "DiscoverCard";

export default function DiscoverPage() {
  const router = useRouter();
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [topCharts, setTopCharts] = useState([]);
  const [topChartsLoading, setTopChartsLoading] = useState(true);

  // Fetch trending playlists
  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${apiUrl}/api/search/playlists?query=trending&page=0&limit=12`
        );
        const data = await res.json();

        if (isMounted && data.success && data.data?.results) {
          setTrendingPlaylists(
            data.data.results.map((p) => ({
              id: p.id,
              name: p.title,
              image: p.image ? [{ quality: "default", url: p.image }] : [],
              songCount: p.songCount || 0,
              description: p.description || "",
              source: "jiosaavn",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching trending playlists:", err);
      } finally {
        if (isMounted) setTrendingLoading(false);
      }
    };

    fetchTrending();
    return () => { isMounted = false; };
  }, []);

  // Fetch recommendations
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/recommendations");
        const data = await res.json();

        if (isMounted && data.success && data.data?.length > 0) {
          setRecommendations(
            data.data.map((mix) => ({
              id: `mix-${mix.mixIndex}`,
              _mixId: mix._id,
              name: mix.title,
              songIds: mix.songIds || [],
              source: "mix",
              image: mix.coverImage
                ? [{ quality: "500x500", url: mix.coverImage }]
                : [],
              songCount: mix.songIds?.length || 0,
              description: `${mix.songIds?.length || 0} songs`,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        if (isMounted) setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, []);

  // Fetch top charts
  useEffect(() => {
    let isMounted = true;
    const fetchTopCharts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${apiUrl}/api/search/playlists?query=top%20charts&page=0&limit=12`
        );
        const data = await res.json();

        if (isMounted && data.success && data.data?.results) {
          setTopCharts(
            data.data.results.map((p) => ({
              id: p.id,
              name: p.title,
              image: p.image ? [{ quality: "default", url: p.image }] : [],
              songCount: p.songCount || 0,
              description: p.description || "",
              source: "jiosaavn",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching top charts:", err);
      } finally {
        if (isMounted) setTopChartsLoading(false);
      }
    };

    fetchTopCharts();
    return () => { isMounted = false; };
  }, []);

  const handleCardClick = useCallback((playlist) => {
    router.push(
      `/music/playlist/${playlist.id}?songCount=${playlist.songCount || 50}`
    );
  }, [router]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="md:ml-0 overflow-y-auto overflow-x-hidden h-svh relative flex flex-col">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/music">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Discover</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Discover
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore trending playlists, personalized recommendations, and top charts
              </p>
            </div>

            {/* Quick Browse Cards */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Browse By Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <DiscoverCard
                  title="Trending Playlists"
                  description="Discover what's hot right now"
                  link="/music/discover/playlists"
                  count={trendingPlaylists.length}
                  isLoading={trendingLoading}
                />
                <DiscoverCard
                  title="Top Charts"
                  description="Most played and liked tracks"
                  link="/music/discover/top-charts"
                  count={topCharts.length}
                  isLoading={topChartsLoading}
                />
                <DiscoverCard
                  title="Genres"
                  description="Browse music by genre"
                  link="/music/discover/genres"
                />
                <DiscoverCard
                  title="New Releases"
                  description="Latest music releases"
                  link="/music/discover/new-releases"
                />
                <DiscoverCard
                  title="Community Playlists"
                  description="Playlists created by our community"
                  link="/music/discover/community"
                />
                <DiscoverCard
                  title="Recently Played"
                  description="Get back to your listening history"
                  link="/music/discover/recently-played"
                />
              </div>
            </div>

            {/* Trending Playlists Section */}
            {trendingPlaylists.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Trending Now</h2>
                  <Link href="/music/discover/playlists">
                    <Button variant="ghost" size="sm">
                      See All →
                    </Button>
                  </Link>
                </div>
                {trendingLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PlaylistSection
                    playlists={trendingPlaylists.slice(0, 6)}
                    onPlaylistClick={handleCardClick}
                  />
                )}
              </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recommended For You</h2>
                </div>
                {recommendationsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PlaylistSection
                    playlists={recommendations.slice(0, 6)}
                    onPlaylistClick={handleCardClick}
                  />
                )}
              </div>
            )}

            {/* Top Charts Section */}
            {topCharts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Top Charts</h2>
                  <Link href="/music/discover/top-charts">
                    <Button variant="ghost" size="sm">
                      See All →
                    </Button>
                  </Link>
                </div>
                {topChartsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PlaylistSection
                    playlists={topCharts.slice(0, 6)}
                    onPlaylistClick={handleCardClick}
                  />
                )}
              </div>
            )}

            {/* Bottom padding for music player */}
            <div className="pb-24" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
