import { DeleteBlockButton } from "./delete-block-button";
import { MoveBlockButtons } from "./move-block-buttons";

export type HeroBlockData = {
  displayName: string;
  headline: string | null;
};

type Props = {
  pageId: string;
  blockId: string;
  data: HeroBlockData | undefined;
  orderIds: string[];
  orderIndex: number;
  ordinal: string;
};

export function HeroBlock({
  pageId,
  blockId,
  data,
  orderIds,
  orderIndex,
  ordinal,
}: Props) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-stone-900">
          Hero
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <MoveBlockButtons
            pageId={pageId}
            orderIds={orderIds}
            index={orderIndex}
          />
          <DeleteBlockButton pageId={pageId} blockId={blockId} />
          <span className="text-xs text-stone-400">{ordinal}</span>
        </span>
      </div>

      {data ? (
        <div className="mt-2">
          <p className="text-base font-semibold text-stone-900">
            {data.displayName}
          </p>
          {data.headline ? (
            <p className="mt-0.5 text-sm text-stone-600">{data.headline}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
