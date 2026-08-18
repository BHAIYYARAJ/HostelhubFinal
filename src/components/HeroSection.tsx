import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import heroBg from "@/assets/hero-bg.jpg";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
  <section className="relative overflow-hidden bg-warm-gray">
    {/* Background image */}
    <div className="absolute inset-0">
      <img src={heroBg} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
    </div>

    <div className="container relative z-10 pb-16 pt-20 md:pb-24 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t("hero.subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
        className="mx-auto mt-8 max-w-3xl md:mt-10"
      >
        <SearchBar />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mx-auto mt-10 flex max-w-md justify-center gap-8 md:gap-12"
      >
        {[
          { value: "2,400+", label: t("hero.verifiedHostels") },
          { value: "180+", label: t("hero.cities") },
          { value: "48K", label: t("hero.happyStudents") },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-xl font-bold tabular-nums text-foreground md:text-2xl">{s.value}</div>
            <div className="text-xs text-muted-foreground md:text-sm">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
  );
};

export default HeroSection;
