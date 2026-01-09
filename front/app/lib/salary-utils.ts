export function formatSalary(salary: string): string {
  try {
    const matches = salary.replace(/\s/g, "").match(/(\d+(?:[\.,]\d+)?)/g);

    if (matches && matches.length >= 1) {
      const nums = matches.map((m) => parseFloat(m.replace(",", ".")));
      const min = nums[0];
      const max = nums.length > 1 ? nums[1] : min;

      const formatNum = (n: number) => {
        if (n >= 1000) return `${Math.round(n / 1000)}k€`;
        return `${n}€`;
      };

      const lowerSalary = salary.toLowerCase();
      let period = "";

      if (lowerSalary.includes("annuel") || lowerSalary.includes("an"))
        period = "/ an";
      else if (lowerSalary.includes("mensuel") || lowerSalary.includes("mois"))
        period = "/ mois";
      else if (lowerSalary.includes("horaire") || lowerSalary.includes("heure"))
        period = "/ h";

      if (min === max) {
        return `${formatNum(min)} ${period}`;
      }
      return `${formatNum(min)} - ${formatNum(max)} ${period}`;
    }
    return salary;
  } catch (e) {
    return salary;
  }
}