import { useMemo, useState } from "react";
import {
  Play,
  Search,
  ChevronRight,
  Sparkles,
  HelpCircle,
  BookOpen,
  Workflow as WorkflowIcon,
  Users,
  MessageCircleQuestion,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

import {
  SCREEN_GUIDES,
  WORKFLOW_TOURS,
  FAQ_ITEMS,
  ROLE_GUIDES,
  VIEW_TOURS,
  isWorkflowVisibleToRole,
} from "../../data/tutorials";
import type { Role, TourStep } from "../../data/tutorials";
import { useMediaQuery } from "./useMediaQuery";

export interface HelpCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
  activeScreen: string;
  /**
   * Called when the user picks a workflow / role playbook / screen guide
   * and presses "Iniciar", or when they press the Quick Start CTA. The
   * parent is expected to close the modal and set the active tour.
   */
  onLaunchTour: (tour: TourStep[]) => void;
}

interface SearchHit {
  key: string;
  title: string;
  description: string;
  tour: TourStep[];
  tab: "guides" | "workflows" | "roles" | "faqs";
}

/**
 * In-app manual replacing the deleted `HelpCenterModal`. Opens from the
 * `?` topbar button. Centered `Dialog` on >=640px, bottom-anchored
 * `Drawer` on smaller viewports. Tabs: Guías / Flujos / Roles / FAQs.
 * A cmdk `Command` at the top fuzzy-matches across all four tabs
 * post-filtered by role.
 */
export function HelpCenterModal({
  open,
  onOpenChange,
  userRole,
  activeScreen,
  onLaunchTour,
}: HelpCenterModalProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("guides");

  const role = (userRole || "ADMIN") as Role;

  // The Quick Start CTA appears only when the current screen has a
  // dedicated view tour. This is the "Iniciar tutorial de esta pantalla"
  // button at the top of the modal.
  const quickStartTour: TourStep[] | undefined =
    VIEW_TOURS[activeScreen] ?? undefined;

  /**
   * Build a flat list of search hits across all four tabs. Role-based
   * filtering is applied here so the same predicate governs both the
   * Flujos tab and the cmdk search.
   */
  const allHits = useMemo<SearchHit[]>(() => {
    const hits: SearchHit[] = [];

    for (const guide of SCREEN_GUIDES) {
      hits.push({
        key: `guide:${guide.key}`,
        title: guide.title,
        description: guide.description,
        tour: VIEW_TOURS[guide.key] ?? [],
        tab: "guides",
      });
    }

    for (const [key, tour] of Object.entries(WORKFLOW_TOURS)) {
      if (!isWorkflowVisibleToRole(key, role)) continue;
      const firstStep = tour[0];
      hits.push({
        key: `workflow:${key}`,
        title: firstStep?.title ?? key,
        description: firstStep?.content ?? "",
        tour,
        tab: "workflows",
      });
    }

    for (const roleGuide of ROLE_GUIDES) {
      hits.push({
        key: `role:${roleGuide.roleKey}`,
        title: roleGuide.roleName,
        description: roleGuide.description,
        tour: WORKFLOW_TOURS[`helpcenter-tour`] ?? [],
        tab: "roles",
      });
    }

    for (const faq of FAQ_ITEMS) {
      hits.push({
        key: `faq:${faq.question}`,
        title: faq.question,
        description: faq.answer,
        tour: [],
        tab: "faqs",
      });
    }

    return hits;
  }, [role]);

  /**
   * Filtered search results. Empty query → empty (the cmdk list is
   * hidden in favor of the tabs). Non-empty → case-insensitive match
   * against title + description, with role-based filtering already
   * baked into `allHits`.
   */
  const searchResults = useMemo<SearchHit[]>(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return allHits
      .filter(
        (hit) =>
          hit.title.toLowerCase().includes(q) ||
          hit.description.toLowerCase().includes(q),
      )
      .slice(0, 25);
  }, [search, allHits]);

  const handleLaunch = (tour: TourStep[]) => {
    if (!tour || tour.length === 0) return;
    onLaunchTour(tour);
    onOpenChange(false);
  };

  // The body is shared between the Dialog and Drawer so visual parity
  // is guaranteed across breakpoints.
  const body = (
    <div className="flex flex-col gap-4 bg-background">
      {/* Quick Start CTA — only when the active screen has a view tour. */}
      {quickStartTour && (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 dark:bg-primary/15 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Tutorial de esta pantalla
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recorrido interactivo por los elementos clave de la vista
              actual.
            </p>
          </div>
          <Button
            id="tour-helpcenter-launch-btn"
            onClick={() => handleLaunch(quickStartTour)}
            size="sm"
            className="rounded-xl flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Iniciar tutorial de esta pantalla
          </Button>
        </div>
      )}

      {/* Cross-tab search (cmdk). */}
      <div className="rounded-2xl border border-border bg-white dark:bg-zinc-900 overflow-hidden">
        <CommandSearch
          value={search}
          onChange={setSearch}
          onPickHit={(hit) => {
            setSearch("");
            if (hit.tour.length > 0) {
              handleLaunch(hit.tour);
            } else {
              setTab(hit.tab);
            }
          }}
          results={searchResults}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="guides" id="tour-helpcenter-guides-tab">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Guías
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <WorkflowIcon className="w-3.5 h-3.5 mr-1" />
            Flujos
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="w-3.5 h-3.5 mr-1" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <MessageCircleQuestion className="w-3.5 h-3.5 mr-1" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-3">
          <ScrollArea className="h-[40vh]">
            <div className="flex flex-col gap-2 pr-3">
              {SCREEN_GUIDES.map((guide) => {
                const tour = VIEW_TOURS[guide.key] ?? [];
                const Icon = guide.icon;
                return (
                  <ItemRow
                    key={guide.key}
                    icon={<Icon className="w-4 h-4" />}
                    title={guide.title}
                    description={guide.description}
                    onLaunch={() => handleLaunch(tour)}
                    launchable={tour.length > 0}
                  />
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="workflows" className="mt-3">
          <ScrollArea className="h-[40vh]">
            <div className="flex flex-col gap-2 pr-3">
              {Object.entries(WORKFLOW_TOURS)
                .filter(([key]) => isWorkflowVisibleToRole(key, role))
                .map(([key, tour]) => {
                  const firstStep = tour[0];
                  return (
                    <ItemRow
                      key={key}
                      icon={<WorkflowIcon className="w-4 h-4" />}
                      title={firstStep?.title ?? key}
                      description={firstStep?.content ?? ""}
                      onLaunch={() => handleLaunch(tour)}
                      launchable
                    />
                  );
                })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="roles" className="mt-3">
          <ScrollArea className="h-[40vh]">
            <div className="flex flex-col gap-3 pr-3">
              {ROLE_GUIDES.map((rg) => (
                <div
                  key={rg.roleKey}
                  className={`rounded-2xl border bg-gradient-to-br p-4 ${rg.colorClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {rg.roleName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rg.description}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {rg.actions.map((action, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-foreground/80 flex items-start gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-muted-foreground italic mt-3 border-t border-border/50 pt-2">
                    {rg.example}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="faqs" className="mt-3">
          <ScrollArea className="h-[40vh]">
            <Accordion type="single" collapsible className="pr-3">
              {FAQ_ITEMS.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="max-h-[90vh]"
          style={{ backgroundColor: "var(--background)", backdropFilter: "none" }}
        >
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <DrawerTitle>Centro de Ayuda</DrawerTitle>
              </div>
              <DrawerClose className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </DrawerClose>
            </div>
            <DrawerDescription>
              Buscador, guías, flujos, roles y preguntas frecuentes.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">{body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "var(--background)", backdropFilter: "none" }}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <DialogTitle>Centro de Ayuda</DialogTitle>
          </div>
          <DialogDescription>
            Buscador, guías de pantalla, flujos de trabajo, manuales por
            rol y preguntas frecuentes.
          </DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ItemRow({
  icon,
  title,
  description,
  onLaunch,
  launchable,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onLaunch: () => void;
  launchable: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-zinc-900 p-3 flex items-start gap-3 hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>
      </div>
      {launchable && (
        <Button
          size="sm"
          variant="outline"
          onClick={onLaunch}
          className="rounded-xl flex-shrink-0"
        >
          <Play className="w-3 h-3 mr-1" />
          Iniciar
        </Button>
      )}
    </div>
  );
}

/**
 * Local cmdk search row. The shared `Command` component is wrapped here
 * to give us a custom empty state and a tab-aware result click handler.
 * The `CommandInput` carries the `tour-helpcenter-search-input` id so
 * the helpcenterTour's third selector resolves.
 */
function CommandSearch({
  value,
  onChange,
  onPickHit,
  results,
}: {
  value: string;
  onChange: (v: string) => void;
  onPickHit: (hit: SearchHit) => void;
  results: SearchHit[];
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          id="tour-helpcenter-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar ayuda..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {value.trim().length >= 2 && (
        <div className="max-h-[30vh] overflow-y-auto p-1">
          {results.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Sin resultados para &ldquo;{value}&rdquo;.
            </p>
          ) : (
            results.map((hit) => (
              <button
                key={hit.key}
                onClick={() => onPickHit(hit)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors flex items-start gap-2"
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1 w-14 flex-shrink-0">
                  {tabLabel(hit.tab)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-foreground truncate">
                    {hit.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground line-clamp-1">
                    {hit.description}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function tabLabel(tab: SearchHit["tab"]): string {
  switch (tab) {
    case "guides":
      return "Guía";
    case "workflows":
      return "Flujo";
    case "roles":
      return "Rol";
    case "faqs":
      return "FAQ";
  }
}
