import { topCategoryStyles } from "@/constants";
import { formatAmount } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export function Category({ category }: CategoryProps) {
  const styles =
    topCategoryStyles[category.name as keyof typeof topCategoryStyles] ??
    topCategoryStyles.default;

  const remainingBudget = category.totalCount - category.count;

  return (
    <div className={`rounded-lg flex gap-4 p-4 ${styles.bg}`}>
      <div
        className={`h-10 w-10 flex-shrink-0 rounded-full grid place-items-center ${styles.circleBg}`}
      >
        <Image
          src={styles.icon}
          alt={`${category.name} icon`}
          height={20}
          width={20}
        />
      </div>
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <span className={`inline-block ${styles.text.main}`}>
            {category.name}
          </span>
          <div className={`inline-block ${styles.text.count}`}>
            {formatAmount(remainingBudget)}
          </div>
        </div>
        <Progress
          value={(category.count / category.totalCount) * 100}
          className={styles.progress.bg}
          indicatorClassName={styles.progress.indicator}
        />
      </div>
    </div>
  );
}
