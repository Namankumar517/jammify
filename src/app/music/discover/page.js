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

export default function DiscoverPage() {
  const router = useRouter();
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState([]);
  const [topChartsPlaylists, setTopChartsPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPlaylists = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all three types in parallel
        // Note: "recommended" query returns 0 results, using "best" instead
        const [trendingRes, recommendedRes, topChartsRes] = await Promise.all([
          fetch("https://saavn.sumit.co/api/search/playlists?query=trending&page=1&limit=12"),
          fetch("https://saavn.sumit.co/api/search/playlists?query=best&page=1&limit=12"),
          fetch("https://saavn.sumit.co/api/search/playlists?query=top+charts&page=1&limit=12"),
        ]);

        const trendingData = await trendingRes.json();
        const recommendedData = await recommendedRes.json();
        const topChartsData = await topChartsRes.json();

        // Process trending
        if (trendingData.success && trendingData.data?.results) {
          setTrendingPlaylists(
            trendingData.data.results.map((p) => ({
              id: p.id,
              name: p.name,
              image: p.image || [],
              songCount: p.songCount || 0,
              description: p.language || "",
              source: "jiosaavn",
            }))
          );
        }

        // Process recommended
        if (recommendedData.success && recommendedData.data?.results) {
          setRecommendedPlaylists(
            recommendedData.data.results.slice(0, 6).map((p) => ({
              id: p.id,
              name: p.name,
              image: p.image || [],
              songCount: p.songCount || 0,
              description: p.language || "",
              source: "jiosaavn",
            }))
          );
        }

        // Process top charts
        if (topChartsData.success && topChartsData.data?.results) {
          setTopChartsPlaylists(
            topChartsData.data.results.map((p) => ({
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
        console.error("Error fetching playlists:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPlaylists();
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

        <div className="flex-1 overflow-y-auto w-full">
          <div className="w-full p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-12">
              {/* Header */}
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Discover</h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Explore trending playlists, personalized recommendations, and top charts
                </p>
              </div>

              {/* Browse by Category */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/music/discover/playlists">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">Trending Playlists</h3>
                      <p className="text-sm text-muted-foreground mt-2">Discover what's trending</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/top-charts">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">Top Charts</h3>
                      <p className="text-sm text-muted-foreground mt-2">Most played tracks</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/genres">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">Genres</h3>
                      <p className="text-sm text-muted-foreground mt-2">Browse by genre</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/new-releases">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">New Releases</h3>
                      <p className="text-sm text-muted-foreground mt-2">Latest music</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/community">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">Community Playlists</h3>
                      <p className="text-sm text-muted-foreground mt-2">User created</p>
                    </div>
                  </Link>

                  <Link href="/music/discover/recently-played">
                    <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <h3 className="font-bold text-lg">Recently Played</h3>
                      <p className="text-sm text-muted-foreground mt-2">Your history</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Trending Section */}
              {trendingPlaylists.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Trending Now</h2>
                    <Link href="/music/discover/playlists">
                      <Button variant="ghost" className="text-primary">See All →</Button>
                    </Link>
                  </div>
                  <PlaylistSection
                    playlists={trendingPlaylists.slice(0, 6)}
                    onPlaylistClick={handleCardClick}
                  />
                </div>
              )}

              {/* Recommended Section */}
              {recommendedPlaylists.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
                  <PlaylistSection
                    playlists={recommendedPlaylists}
                    onPlaylistClick={handleCardClick}
                  />
                </div>
              )}

              {/* Top Charts Section */}
              {topChartsPlaylists.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Top Charts</h2>
                    <Link href="/music/discover/top-charts">
                      <Button variant="ghost" className="text-primary">See All →</Button>
                    </Link>
                  </div>
                  <PlaylistSection
                    playlists={topChartsPlaylists.slice(0, 6)}
                    onPlaylistClick={handleCardClick}
                  />
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-20">
                  <p className="text-muted-foreground">Loading discover content...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && trendingPlaylists.length === 0 && recommendedPlaylists.length === 0 && topChartsPlaylists.length === 0 && (
                <div className="flex justify-center items-center py-20">
                  <p className="text-muted-foreground">No content available</p>
                </div>
              )}

              {/* Spacer */}
              <div className="h-32" />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
