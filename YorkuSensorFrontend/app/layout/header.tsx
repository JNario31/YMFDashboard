import Link from "next/link";

export default function Header(){
    return(
        <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur">
            <nav>
                <Link
                href={"/"}
                className="flex h-16 items-center justify-between px-4">
                    <h1 className="text-lg font-semibold">York University MicroFabrication Lab</h1>
                </Link>
            </nav>
        </div>
    );
}