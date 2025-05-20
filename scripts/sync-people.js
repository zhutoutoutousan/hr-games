var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var createClient = require('@supabase/supabase-js').createClient;
var fetchWithRetry = require('@/lib/utils').fetchWithRetry;
require('dotenv').config();
var supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
var AVATURE_API_KEY = process.env.AVATURE_API_KEY;
var AVATURE_BASE_URL = 'https://voutiquefteng.avature.net/rest/upfront';
var SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
function syncPeople() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, peopleIds, _i, peopleIds_1, id, existingPerson, detailResponse, detailData, formData, error, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    console.log('Starting people sync...');
                    return [4 /*yield*/, fetchWithRetry("".concat(AVATURE_BASE_URL, "/people"), {
                            headers: {
                                'accept': 'application/json',
                                'X-Avature-REST-API-Key': AVATURE_API_KEY,
                            },
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    peopleIds = data.items.map(function (item) { return item.id; });
                    console.log("Found ".concat(peopleIds.length, " people to sync"));
                    _i = 0, peopleIds_1 = peopleIds;
                    _a.label = 3;
                case 3:
                    if (!(_i < peopleIds_1.length)) return [3 /*break*/, 11];
                    id = peopleIds_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 9, , 10]);
                    return [4 /*yield*/, supabase
                            .from('People')
                            .select('id')
                            .eq('avatureId', id.toString())
                            .single()];
                case 5:
                    existingPerson = (_a.sent()).data;
                    if (existingPerson) {
                        console.log("Person ".concat(id, " already exists in database, skipping..."));
                        return [3 /*break*/, 10];
                    }
                    return [4 /*yield*/, fetchWithRetry("".concat(AVATURE_BASE_URL, "/people/").concat(id, "/form_1172"), {
                            headers: {
                                'accept': 'application/json',
                                'X-Avature-REST-API-Key': AVATURE_API_KEY,
                            },
                        })];
                case 6:
                    detailResponse = _a.sent();
                    return [4 /*yield*/, detailResponse.json()];
                case 7:
                    detailData = _a.sent();
                    formData = detailData.items[0];
                    return [4 /*yield*/, supabase
                            .from('People')
                            .insert({
                            id: id.toString(),
                            avatureId: id.toString(),
                            name: formData["我们如何称呼您？"] || "未提供",
                            email: formData["您的邮箱？"] || "未提供",
                            gender: formData.性别 || "未提供",
                            industry: formData["您所在行业是？"] || "未提供",
                            position: formData["您的职位"] || "未提供",
                            hobbies: formData["您的爱好是？"] || "未提供",
                            favoriteFood: formData["您最喜欢吃的东西？"] || "未提供",
                            leastFavoriteFood: formData["您最讨厌吃的东西？"] || "未提供",
                            hrConcern: formData["您现在在HR领域最关心的一个问题是？"] || "未提供",
                            weekendActivity: formData["你和朋友一起度过周末时，通常会："] || "未提供",
                            socialPreference: formData["你更喜欢哪种社交场合？"] || "未提供",
                            avatarRequest: formData["想知道您匹配度最高的新朋友是谁吗？与我们分享您的头像，方便TA找到你"] || null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        })];
                case 8:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Error creating person ".concat(id, ":"), error);
                        throw error;
                    }
                    console.log("Successfully synced person ".concat(id));
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("Failed to sync person ".concat(id, ":"), error_1);
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 3];
                case 11:
                    console.log('People sync completed successfully');
                    return [3 /*break*/, 13];
                case 12:
                    error_2 = _a.sent();
                    console.error('Failed to sync people:', error_2);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Function to start the infinite sync loop
function startSyncLoop() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, syncPeople()];
                case 1:
                    _a.sent();
                    console.log("Waiting ".concat(SYNC_INTERVAL / 1000, " seconds before next sync..."));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, SYNC_INTERVAL); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Start the sync loop
console.log('Starting infinite people sync loop...');
startSyncLoop().catch(function (error) {
    console.error('Fatal error in sync loop:', error);
    process.exit(1);
});
