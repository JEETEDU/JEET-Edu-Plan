import BookList from "@/app/(main)/(links)/book/components/bookList";

export default function Mobile() {
    return (
        <div className="grid grid-cols-1 pl-2 pr-1 pb-2 w-full h-full">
            <BookList isMobile={true} />
        </div>
    )
}