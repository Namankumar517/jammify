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
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionPlaylists, setSectionPlaylists] = useState({});
  const [playlistsLoading, setPlaylistsLoading] = useState({});

  // Fetch all sections from MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchSections = async () => {
      try {
        const res = await fetch("/api/sections");
        const data = await res.json();

        if (isMounted && data.success && data.data) {
          setSections(data.data);
          // Initialize loading states for each section
          const loadingStates = {};
          data.data.forEach((section) => {
            loadingStates[section._id] = true;
          });
          setPlaylistsLoading(loadingStates);
        }
      } catch (err) {
        console.error("Error fetching sections:", err);
      } finally {
        if (isMounted) setSectionsLoading(false);
      }
    };

    fetchSections();
    return () => { isMounted = false; };
  }, []);

  // Fetch playlists for each section from MongoDB
  useEffect(() => {
    let isMounted = true;

    const fetchPlaylistsForSections = async () => {
      if (sections.length === 0) return;

      for (const section of sections) {
        try {
          const res = await fetch(
            `/api/spotify-playlists?sectionId=${section._id}&limit=12`
          );
          const data = await res.json();

          if (isMounted && data.success && data.data) {
            const playlists = data.data.map((p) => ({
              id: p._id,
              name: p.name,
              image: p.image ? [{ quality: "default", url: p.image }] : [],
              songCount: p.songCount || 0,
              description: p.description || "",
              source: "spotify",
              songIds: p.songIds || [],
            }));

            setSectionPlaylists((prev) => ({
              ...prev,
              [section._id]: playlists,
            }));

            setPlaylistsLoading((prev) => ({
              ...prev,
              [section._id]: false,
            }));
          }
        } catch (err) {
          console.error(`Error fetching playlists for section ${section._id}:`, err);
          setPlaylistsLoading((prev) => ({
            ...prev,
            [section._id]: false,
          }));
        }
      }
    };

    if (sections.length > 0) {
      fetchPlaylistsForSections();
    }

    return () => { isMounted = false; };
  }, [sections]);

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
                  Explore curated playlists and collections
                </p>
              </div>

              {/* Loading State */}
              {sectionsLoading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading discover content...</p>
                </div>
              )}

              {/* Sections with Playlists */}
              {!sectionsLoading && sections.length > 0 && (
                <div className="space-y-12">
                  {sections.map((section) => {
                    const playlists = sectionPlaylists[section._id] || [];
                    const isLoading = playlistsLoading[section._id] !== false;

                    return (
                      <div key={section._id}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-semibold capitalize">
                            {section.name}
                          </h2>
                          {playlists.length > 0 && (
                            <Link href={`/music/section/${section._id}`}>
                              <Button variant="ghost">See All →</Button>
                            </Link>
                          )}
                        </div>

                        {isLoading ? (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground text-sm">Loading...</p>
                          </div>
                        ) : playlists.length > 0 ? (
                          <PlaylistSection
                            playlists={playlists.slice(0, 6)}
                            onPlaylistClick={handleCardClick}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground text-sm">No playlists available</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!sectionsLoading && sections.length === 0 && (
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
