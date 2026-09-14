"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractQuestionFigureUrl } from "@/lib/utils/figure";

interface QuestionFigureProps {
  imageUrl?: string | null;
  questionText?: string;
  caption?: string;
  className?: string;
}

export function QuestionFigure({
  imageUrl,
  questionText,
  caption = "Figure / Diagram",
  className = "",
}: QuestionFigureProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [imgError, setImgError] = React.useState(false);

  // Resolve image URL from direct prop or inline markdown in questionText
  const resolvedUrl = React.useMemo(() => {
    if (imageUrl && imageUrl.trim().length > 0) return imageUrl.trim();
    if (questionText) {
      return extractQuestionFigureUrl({ questionText });
    }
    return undefined;
  }, [imageUrl, questionText]);

  if (!resolvedUrl || imgError) {
    return null;
  }

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <>
      <div className={`my-3 space-y-1.5 ${className}`}>
        <div className="relative group inline-block max-w-full rounded-xl border border-border bg-card/60 p-2 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
          {/* Header tag */}
          <div className="flex items-center justify-between gap-2 pb-1.5 px-1 border-b border-border/40 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-muted-foreground font-mono">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              {caption}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setZoomLevel(1);
                setModalOpen(true);
              }}
              className="h-6 px-2 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
            >
              <ZoomIn className="h-3 w-3" />
              <span>Enlarge Figure</span>
            </Button>
          </div>

          {/* Main Image View */}
          <div
            onClick={() => {
              setZoomLevel(1);
              setModalOpen(true);
            }}
            className="cursor-zoom-in overflow-hidden rounded-lg bg-muted/10 flex items-center justify-center p-2 max-h-72 sm:max-h-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedUrl}
              alt={caption}
              onError={() => setImgError(true)}
              className="max-h-64 sm:max-h-72 w-auto max-w-full object-contain rounded transition-transform group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>

          <div className="px-1 pt-1 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Click image to view high-resolution zoom</span>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative flex flex-col max-w-5xl w-full max-h-[92vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20 shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  {caption} (High Resolution Preview)
                </span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {Math.round(zoomLevel * 100)}%
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-7 w-7 p-0"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-7 w-7 p-0"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-7 w-7 p-0"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1"
                  title="Open Raw Image in New Tab"
                >
                  <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="h-7 w-7 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Image Container with Pan / Zoom */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-muted/10 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedUrl}
                alt={caption}
                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                className="max-w-full max-h-[70vh] object-contain rounded shadow-md origin-center"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
