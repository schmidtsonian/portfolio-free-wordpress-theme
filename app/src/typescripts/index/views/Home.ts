/// <reference path="../../common/View.ts" />

module views{
    
    export class Home extends common.View{
        
        bind():void {
            var tl = new TimelineMax({paused: true });
			
			tl.staggerTo(["#c-0", "#c-1"], 0.55, { borderRadius: "0", width: "600px", height: "600px", opacity: 1 }, 0.2);
			tl.to(["#c-0", "#c-1"], 0.15, { width: "100%", height: "100%", backgroundColor: "#DED4B9" });

			tl.to("#c-2", 0.5, { x: "0", transformOrigin: "-300% -100%" }, "-=0.25");
			tl.to("#c-2", 0.25, { y: "-100%", transformOrigin: "-300% -100%" }, "-=0.5");
			tl.to("#c-2", 0.25, { y: "50px", transformOrigin: "-300% -100%" }, "-=0.25");
			tl.to("#c-2", 0.25, { width: "10px", height: "10px", transformOrigin: "0 0" });
			tl.to("#c-2", 0.15, { width: "50px", height: "50px", ease: Elastic.easeOut });
			tl.to("#c-2", 0.25, { x: "150px" });
			tl.to("#c-2", 0.25, { x: "0", ease: Elastic.easeOut });
			
			tl.set("#c-3", { opacity: 1 }, "-=0.25");
			tl.to("#c-3", 0.55, { scale: 1, x: "-150px", ease: Elastic.easeOut }, "-=0.25");
			tl.to("#c-2", 0.15, { x: "25px", backgroundColor: "#64B6B1" });
			tl.to("#c-3", 0.15, { x: "-25px", backgroundColor: "#64B6B1" }, "-=0.15");
			
			tl.to("#c-2", 0.15, { x: "125px" });
			tl.to("#c-3", 0.15, { x: "-125px" }, "-=0.15");

			tl.to("#c-2", 0.85, { x: "45px", ease: Cubic.easeOut });
			tl.to("#c-3", 0.85, { x: "-45px", ease: Cubic.easeOut }, "-=0.85");

			tl.to("#c-2", 0.15, { x: "125px" });
			tl.to("#c-3", 0.15, { x: "-125px" }, "-=0.15");

			tl.to("#c-2", 0.45, { x: "25px", ease: Cubic.easeOut });
			tl.to("#c-3", 0.45, { x: "-25px", ease: Cubic.easeOut }, "-=0.45");

			tl.to("#c-2", 0.15, { x: "145px" });
			tl.to("#c-3", 0.15, { x: "-145px" }, "-=0.15");

			tl.to(["#c-2", "#c-3"], 0.15, { x: "0", ease: Cubic.easeIn });
			tl.to(["#c-2", "#c-3"], 0.35, { width: "80px", height: "80px", ease: Elastic.easeOut });
			tl.to(["#c-2", "#c-3"], 1.25, { width: "100px", height: "100px", delay: 0.05, ease: Quart.easeIn });
			tl.to(["#c-2", "#c-3"], 0.25, { width: "20px", height: "20px", delay: 0.05, ease: Cubic.easeOut });
			tl.to(["#c-2", "#c-3"], 0.15, { opacity: 0, width: "150px", height: "150px", delay: 0.05, ease: Elastic.easeOut });

            $("#block-about")
                .on("mouseenter", () => { tl.play(); })
                .on("mouseleave", () => { tl.seek(0); tl.stop(); });
            $("#block-home").on("click", function() { $(this).toggleClass("active"); });
			
        }
    }
}