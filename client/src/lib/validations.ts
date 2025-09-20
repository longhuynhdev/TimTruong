import { z } from "zod";

export const dgnlScoreSchema = z.number().min(300, "Điểm ĐGNL phải từ 300").max(1200, "Điểm ĐGNL phải dưới 1200");
export const thptqgScoreSchema = z.number().min(9, "Điểm THPTQG phải từ 9").max(30, "Điểm THPTQG phải dưới 30");