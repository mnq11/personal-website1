import React, { useMemo } from "react";
import TimelineItem from "./TimelineItem";
import TimelineHeader from "./TimelineHeader";
import Resume from "../../resume.json";

function Timeline() {
    const workYears = useMemo(() => {
        return Resume.work
            .map((item) => new Date(item.startDate).getFullYear())
            .filter((value, index, self) => self.indexOf(value) === index);
    }, []);

    const timelineContent = useMemo(() => {
        return workYears.flatMap((year, i) => {
            const header = <TimelineHeader key={`header-${i}`} year={year} />;
            const items = Resume.work
                .filter((work) => new Date(work.startDate).getFullYear() === year)
                .map((item, j) => {
                    const { startDate, company, summary, position, endDate } = item;
                    const date = new Date(startDate).toLocaleString("en-UK", {
                        month: "long",
                        year: "numeric",
                    });

                    return (
                        <TimelineItem
                            key={`item-${i}-${j}`} // Combining i and j for uniqueness
                            date={date}
                            company={company}
                            summary={summary}
                            position={position}
                            endDate={endDate}
                        />
                    );
                });

            return [header, ...items];
        });
    }, [workYears]);

    return (
        <div className="timeline is-centered">
            <header className="timeline-header">
        <span className="tag is-medium is-dark">
          {new Date().getFullYear()}
        </span>
            </header>
            <div className="timeline-item">
                <div className="timeline-marker is-success"></div>
                <div className="timeline-content"></div>
            </div>
            {timelineContent}
        </div>
    );
}

export default Timeline;
