"use client";

import useSWR from "swr";
import { useState, useCallback, useRef, useEffect } from "react";
import HeroHeader from "@/components/HeroHeader";
import FileUploader from "@/components/FileUploader";
import SummaryBar from "@/components/SummaryBar";
import DataTable from "@/components/DataTable";
import DetailPanel from "@/components/DetailPanel";
import Footer from "@/components/Footer";

export interface ImageRow {
  RELATIVE_PATH: string;
  SIZE: number;
  LAST_MODIFIED: string;
  FILE_URL: string;
  TOTAL_ATTENDEES: number;
  RAISED_HANDS: number;
  PERCENTAGE_WITH_HANDS_UP: number;
  CAPTION: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: images,
    isLoading,
    isValidating,
    mutate: mutateImages,
  } = useSWR<ImageRow[]>("/api/images", fetcher, {
    refreshInterval: isPolling ? 5000 : 0,
    revalidateOnFocus: true,
  });

  const { data: fileCountData } = useSWR<{ count: number }>(
    "/api/file-count",
    fetcher,
    { refreshInterval: 10000 }
  );

  const prevFileCount = useRef<number | null>(null);
  useEffect(() => {
    if (fileCountData?.count !== undefined) {
      if (
        prevFileCount.current !== null &&
        fileCountData.count !== prevFileCount.current
      ) {
        mutateImages();
      }
      prevFileCount.current = fileCountData.count;
    }
  }, [fileCountData, mutateImages]);

  const handleUploadComplete = useCallback(() => {
    setIsPolling(true);
    mutateImages();

    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(() => {
      setIsPolling(false);
    }, 60000);
  }, [mutateImages]);

  const data = Array.isArray(images) ? images : [];
  const selectedData = data.find((r) => r.RELATIVE_PATH === selectedRow);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100/50">
      <HeroHeader />
      <main className="flex-1 pb-8">
        <FileUploader onUploadComplete={handleUploadComplete} />

        {isPolling && data.length === 0 && !isLoading && (
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-4">
            <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium text-indigo-600">
              Waiting for Cortex AI to finish analyzing your images...
            </p>
          </div>
        )}

        <SummaryBar data={data} />
        <DataTable
          data={data}
          selectedRow={selectedRow}
          onSelectRow={setSelectedRow}
          isLoading={isLoading}
          isRefreshing={isValidating && !isLoading}
        />
        {selectedData && <DetailPanel row={selectedData} />}
      </main>
      <Footer />
    </div>
  );
}
