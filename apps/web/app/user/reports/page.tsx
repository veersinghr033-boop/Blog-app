"use client";

import ReportCard from "@/components/ui/ReportCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/utills/axios";

 function Page() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["reports"],
        queryFn: async ({ pageParam }) => {
            const res = await api.get("/reports/report", {
                params: {
                    before: pageParam,
                },
            });

            return res.data;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) =>
            lastPage.nextCursor || undefined,
    });
    const reports =
        data?.pages.flatMap((page) => page.reports) ?? [];

    return (
        <ReportCard
            data={reports}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
        />
    );
}

export default Page