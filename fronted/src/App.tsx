import React, { useState } from "react";
import { ArrowRight, Timer, Coins, AlertCircle } from "lucide-react";

// List of banks
const banks = [
  "ADDBINBBXXX",
  "IRVTUS3NXXX",
  "BENDAU3BXXX",
  "BNPAFRPPXXX",
  "FVLBNL22XXX",
  "CICIFRPPXXX",
  "CCBPFRPPXXX",
  "RABOCHGGXXX",
  "SGBLAU2SXXX",
  "KNABNL2HXXX",
  "MHCBJPJTXXX",
  "ABNANL2AXXX",
  "CMBCCNBSXXX",
  "DEUTDEBBXXX",
  "MMTOJPJTXXX",
  "RBOSAU2SXXX",
  "NATAAU3302S",
  "BLKBCH22XXX",
  "CRESCHZZXXX",
  "BNPAGB22XXX",
  "SCBLGB2LXXX",
  "CRLYFRPPXXX",
  "INDCCNSHXXX",
  "UNIACNBJXXX",
  "AGRIFRPPXXX",
  "HSBCGB2LXXX",
  "CHASJPJTXXX",
  "CETCCNBJXXX",
  "PSBCCNBJXXX",
  "AGRNGB2LXXX",
  "SBININBBFXD",
  "NFBKUS33XXX",
  "ZENJJPJTXXX",
  "ANZBAU3MXXX",
  "KKBKINBBXXX",
  "BOTKJPJTXXX",
  "SNSBNL2AXXX",
  "RVSADE77XXX",
  "ICBKJPJTXXX",
  "BCVACH2LXXX",
  "LLOYGB2LXXX",
  "BARCGB22XXX",
  "SMBCJPJTXXX",
  "PNCINTNNXXX",
  "NACNJPJTXXX",
  "NWBKGB2LXXX",
  "MARBDE6LXXX",
  "CUSCAU2SXXX",
  "INDBINBBBBI",
  "ICICINBBCTS",
  "WFBIUS6SXXX",
  "ABOCCNBJXXX",
  "BKCHCNBJXXX",
  "BBVAFRPPXXX",
  "CMADFRPPXXX",
  "CALDFR21XXX",
  "HYVEDEMMXXX",
  "HELADEF1RRS",
  "CORPINBBXXX",
  "CIBCUS33XXX",
  "GFSIUS4PXXX",
  "HSBCAU2SXXX",
  "UTIBINBBTCP",
  "TRIONL2UXXX",
  "BOFAUS3NXXX",
  "BCVSCH2LXXX",
  "BAFUCH22XXX",
  "DRESDEFFXXX",
  "UTIBINBBXXX",
  "QSNWAU4BXXX",
  "NWABNL2GXXX",
  "CITIUS33XXX",
  "CHASUS33XXX",
  "MSKBJPJTXXX",
  "HDFCINBBXXX",
  "UBSWCHZH80A",
  "CCBCCNBJXXX",
  "USBKUS44XXX",
  "BOCMCNBJXXX",
  "GENODEFFXXX",
  "RABONL2UXXX",
  "RBOSGB2LXXX",
  "ABBECHZZXXX",
  "SOGEFRPPXXX",
  "BKWAAU4SXXX",
  "MIDLGB22XXX",
  "MALADE51XXX",
  "COBADEFFXXX",
  "JPMCGB2LXXX",
  "IDIBINBBTSY",
  "WPACAU2SXXX",
  "RBRBNL21XXX",
  "SNNFJPJTXXX",
  "ASNBNL21XXX",
  "INGBNL2AXXX",
  "PCBCCNBJXXX",
  "CITIFRPPXXX",
  "INGBDEFFXXX",
];

// API endpoints
const API_ENDPOINTS = {
  fastest: "http://localhost:3000/api/fastestroute",
  cheapest: "http://localhost:3000/api/cheapestroute",
};

interface PathResponse {
  success: boolean;
  path?: string;
  metric?: string;
  error?: string;
}

function App() {
  const [fromBank, setFromBank] = useState("");
  const [toBank, setToBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    path?: string;
    metric?: string;
    type: "time" | "cost" | null;
    error?: string;
  } | null>(null);

  const fetchPath = async (
    type: "fastest" | "cheapest"
  ): Promise<PathResponse> => {
    try {
      const response = await fetch(API_ENDPOINTS[type], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromBank, toBank }),
      });
      console.log(response);
      if (response.ok) {
        const r = await response.json();
        console.log(r);
        return {
          success: true,
          path: r.route,
          metric: type === "fastest" ? r.time : r.cost,
        };
      }

      return { success: false, error: "Failed to fetch path" };
    } catch (error) {
      return { success: false, error: "Failed to fetch path" };
    }
  };

  const handleCheckPath = async (type: "fastest" | "cheapest") => {
    try {
      setLoading(true);
      const response = await fetchPath(type);

      if (response.success && response.path && response.metric) {
        setResult({
          path: response.path,
          metric: response.metric,
          type: type === "fastest" ? "time" : "cost",
        });
      } else {
        setResult({
          type: type === "fastest" ? "time" : "cost",
          error: response.error || "An unexpected error occurred",
        });
      }
    } catch (error) {
      setResult({
        type: type === "fastest" ? "time" : "cost",
        error: "Failed to fetch path. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get the Best Banking Path
          </h1>
          <p className="text-lg text-gray-600">
            Find the fastest or most cost-effective route between banks
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Bank
              </label>
              <select
                value={fromBank}
                onChange={(e) => setFromBank(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="">Select a bank</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Bank
              </label>
              <select
                value={toBank}
                onChange={(e) => setToBank(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="">Select a bank</option>
                {banks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleCheckPath("fastest")}
              disabled={!fromBank || !toBank || loading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Timer className="w-5 h-5 mr-2" />
              {loading ? "Checking..." : "Check Fastest Path"}
            </button>
            <button
              onClick={() => handleCheckPath("cheapest")}
              disabled={!fromBank || !toBank || loading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-5 h-5 mr-2" />
              {loading ? "Checking..." : "Check Cheapest Path"}
            </button>
          </div>
        </div>

        {result && (
          <div
            className={`bg-white rounded-lg shadow-xl p-6 animate-fade-in ${
              result.error ? "border-l-4 border-red-500" : ""
            }`}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {result.error
                ? "No Path Found"
                : `${
                    result.type === "time" ? "Fastest" : "Cheapest"
                  } Path Found`}
            </h2>
            {result.error ? (
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <p>{result.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg text-gray-600">
                  <span className="font-medium">Path:</span>
                  <div className="flex items-center flex-wrap gap-2">
                    {result.path?.split(" -> ").map((bank, index, array) => (
                      <React.Fragment key={index}>
                        <span className="bg-blue-50 px-3 py-1 rounded-full">
                          {bank}
                        </span>
                        {index < array.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-lg text-gray-600">
                  <span className="font-medium">
                    {result.type === "time" ? "Total Time:" : "Total Cost:"}
                  </span>
                  <span className="bg-green-50 px-3 py-1 rounded-full">
                    {result.metric}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
