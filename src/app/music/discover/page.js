"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const JIOSAAVN_API = "https://saavn.sumit.co/api";

export default function DiscoverPage() {
  const router = useRouter();
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [topChartsPlaylists, setTopChartsPlaylists] = useState([]);
  const [topChartsLoading, setTopChartsLoading] = useState(true);

  // Fetch trending playlists
  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `${JIOSAAVN_API}/search/playlists?query=trending&page=1&limit=12`
        );
        const data = await res.json();

        if (isMounted && data.success && data.data?.results) {
          setTrendingPlaylists(
            data.data.results.map((p) => ({
              id: p.id,
              name: p.name,
              image: p.image || [],
              songCount: p.songCount || 0,
              description: p.language || "",
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

  // Fetch recommended playlists
  useEffect(() => {
    let isMounted = true;
    const fetchRecommended = async () => {
      try {
        const res = await fetch(
          `${JIOSAAVN_API}/search/playlists?query=recommended&page=1&limit=12`
        );
        const data = await res.json();

        if (isMounted && data.success && data.data?.results) {
          setRecommendedPlaylists(
            data.data.results
              .slice(0, 6)
              .map((p) => ({
                id: p.id,
                name: p.name,
                image: p.image || [],
                songCount: p.songCount || 0,
                description: p.language || "",
                source: "jiosaavn",
              }))
          );
        }
      } catch (err) {
        console.error("Error fetching recommended playlists:", err);
      } finally {
        if (isMounted) setRecommendedLoading(false);
      }
    };

    fetchRecommended();
    return () => { isMounted = false; };
  }, []);

  // Fetch top charts playlists
  useEffect(() => {
    let isMounted = true;
    const fetchTopCharts = async () => {
      try {
        const res = await fetch(
          `${JIOSAAVN_API}/search/playlists?query=top+charts&page=1&limit=12`
        );
        const data = await res.json();

        if (isMounted && data.success && data.data?.results) {
          setTopChartsPlaylists(
            data.data.results.map((p) => ({
              id: p.id,
              name: p.name,
              image: p.image || [],
              songCount: p.songCount || 0,
              description: p.language || "",
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

  const handleCardClick = (playlist) => {
    router.push(
      `/music/playlist/${playlist.id}?songCount=${playlist.songCount || 50}`
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar className="hidden md:flex" />
      <SidebarInset className="md:ml-0 overflow-y-auto overflow-x-hidden h-svh relative flex flex-col">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/music">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Discover</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="pt-2">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  Discover
                </h1>
                <p className="text-muted-foreground text-base">
                  Explore trending playlists, personalized recommendations, and top charts
                </p>
              </div>

              {/* Quick Browse Categories */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/music/discover/playlists">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">Trending Playlists</h3>
                      <p className="text-sm text-muted-foreground mt-1">Discover what's hot right now</p>
                      <p className="text-xs text-muted-foreground mt-3">{trendingPlaylists.length} playlists</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/top-charts">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">Top Charts</h3>
                      <p className="text-sm text-muted-foreground mt-1">Most played and liked tracks</p>
                      <p className="text-xs text-muted-foreground mt-3">{topChartsPlaylists.length} playlists</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/genres">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">Genres</h3>
                      <p className="text-sm text-muted-foreground mt-1">Browse music by genre</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/new-releases">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">New Releases</h3>
                      <p className="text-sm text-muted-foreground mt-1">Latest music releases</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/community">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">Community Playlists</h3>
                      <p className="text-sm text-muted-foreground mt-1">Playlists created by our community</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/recently-played">
                    <div className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">Recently Played</h3>
                      <p className="text-sm text-muted-foreground mt-1">Get back to your listening history</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Trending Playlists */}
              {trendingPlaylists.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Trending Now</h2>
                    <Link href="/music/discover/playlists">
                      <Button variant="ghost">See All →</Button>
                    </Link>
                  </div>
                  {trendingLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                  ) : (
                    <PlaylistSection
                      playlists={trendingPlaylists.slice(0, 6)}
                      onPlaylistClick={handleCardClick}
                    />
                  )}
                </div>
              )}

              {/* Recommended Playlists */}
              {recommendedPlaylists.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Recommended For You</h2>
                  </div>
                  {recommendedLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                  ) : (
                    <PlaylistSection
                      playlists={recommendedPlaylists}
                      onPlaylistClick={handleCardClick}
                    />
                  )}
                </div>
              )}

              {/* Top Charts */}
              {topChartsPlaylists.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Top Charts</h2>
                    <Link href="/music/discover/top-charts">
                      <Button variant="ghost">See All →</Button>
                    </Link>
                  </div>
                  {topChartsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Loading...</p>
                    </div>
                  ) : (
                    <PlaylistSection
                      playlists={topChartsPlaylists.slice(0, 6)}
                      onPlaylistClick={handleCardClick}
                    />
                  )}
                </div>
              )}

              {/* Loading State - All sections */}
              {trendingLoading && recommendedLoading && topChartsLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading discover content...</p>
                </div>
              )}

              {/* Empty State */}
              {!trendingLoading &&
                !recommendedLoading &&
                !topChartsLoading &&
                trendingPlaylists.length === 0 &&
                recommendedPlaylists.length === 0 &&
                topChartsPlaylists.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No content available</p>
                  </div>
                )}

              {/* Bottom padding for music player */}
              <div className="pb-24" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
