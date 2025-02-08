import BookList from "@/app/(main)/(links)/book/components/bookList";

export default function Desktop() {
    return (
        <div className="grid grid-cols-3 gap-4 pl-4 pb-4 pr-3 w-full h-full">
            <div className="col-span-2">
                내용
            </div>
            <BookList/>
        </div>
    )
}