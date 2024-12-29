export default function Mobile() {
    const info = {
        name: "나태양",
        grade: "G3-S",
        school: "지트중학교",
    };

    return (<>
            <div className="w-full h-full flex flex-col items-center bg-gray-100">
                <div className="w-full flex flex-row justify-between items-center py-3 px-6">
                    <div className="text-4xl font-bold text-gray-800">
                        {info.name}
                    </div>
                    <div className="w-fit flex flex-col items-end">
                        <div className="text-left text-xl font-bold text-gray-800">
                            {info.grade}
                        </div>
                        <div className="text-left text-l font-bold text-gray-600">
                            {info.school}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}