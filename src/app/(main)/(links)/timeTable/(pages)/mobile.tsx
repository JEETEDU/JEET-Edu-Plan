export default function Mobile() {
    const timetable = {
        date: "2024년 12월 18일 수요일",
        subjects: [
            {text: "1교시", time: 1, color: "#cddafd"},
            {text: "2교시", time: 2, color: "#f4e1d6"},
            {text: "3교시", time: 3, color: "#f0efeb"},
            {text: "4교시", time: 4, color: "#13d9de"},
            {text: "5교시", time: 5, color: "#dfe7fd"},
        ]
    };

    return (
        <>
            <div className="w-full h-full flex flex-col items-center bg-gray-100">
                {/* Header */}
                <div className="text-center text-xl font-bold text-gray-800 mb-4">
                    {timetable.date}
                </div>

                {/* Timetable Grid */}
                <div className="grid gap-1 grid-rows-15 w-full max-w-lg h-full bg-white p-2 rounded-lg shadow-md">
                    {timetable.subjects.map((subject, index) => (
                        <div
                            className="flex items-center justify-center text-black text-lg font-semibold rounded-2"
                            style={{
                                gridRow: `span ${subject.time} / span ${subject.time}`,
                                backgroundColor: subject.color
                            }}
                            key={index}
                        >
                            {subject.text}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
