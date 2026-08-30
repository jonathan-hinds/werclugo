export function StatusMarquee({ text }: { text: string }) { return <div className="status-marquee" role="status"><div>{text} ◆ {text} ◆ {text} ◆&nbsp;</div></div>; }
