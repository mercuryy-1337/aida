import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'For Wonder Woman · A little something',description:'A few little questions. A little bit of magic. Made just for you.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
