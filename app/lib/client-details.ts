export type ClientDetails = {
  browser: string;
  browserVersion: string;
  device: string;
  engine: string;
  os: string;
  osVersion: string;
};

export function parseClientDetails(userAgent: string | null): ClientDetails {
  if (!userAgent) {
    return {
      browser: "-",
      browserVersion: "-",
      device: "-",
      engine: "-",
      os: "-",
      osVersion: "-",
    };
  }

  return {
    browser: detectBrowser(userAgent),
    browserVersion: detectBrowserVersion(userAgent),
    device: detectDevice(userAgent),
    engine: detectEngine(userAgent),
    os: detectOperatingSystem(userAgent),
    osVersion: detectOperatingSystemVersion(userAgent),
  };
}

function detectBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/OPR\//.test(userAgent)) {
    return "Opera";
  }

  if (/Chrome\//.test(userAgent) && !/Chromium\//.test(userAgent)) {
    return "Chrome";
  }

  if (/Firefox\//.test(userAgent)) {
    return "Firefox";
  }

  if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) {
    return "Safari";
  }

  return "未知浏览器";
}

function detectBrowserVersion(userAgent: string) {
  const patterns = [
    /Edg\/([\d.]+)/,
    /OPR\/([\d.]+)/,
    /Chrome\/([\d.]+)/,
    /Firefox\/([\d.]+)/,
    /Version\/([\d.]+).*Safari\//,
  ];

  for (const pattern of patterns) {
    const match = userAgent.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return "-";
}

function detectDevice(userAgent: string) {
  if (/iPad|Tablet/i.test(userAgent)) {
    return "平板";
  }

  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return "手机";
  }

  return "电脑";
}

function detectEngine(userAgent: string) {
  if (/AppleWebKit\//.test(userAgent)) {
    return "WebKit/Blink";
  }

  if (/Gecko\//.test(userAgent)) {
    return "Gecko";
  }

  return "-";
}

function detectOperatingSystem(userAgent: string) {
  if (/Windows NT 10/.test(userAgent)) {
    return "Windows 10/11";
  }

  if (/Windows NT/.test(userAgent)) {
    return "Windows";
  }

  if (/Android/.test(userAgent)) {
    return "Android";
  }

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return "iOS/iPadOS";
  }

  if (/Mac OS X/.test(userAgent)) {
    return "macOS";
  }

  if (/Linux/.test(userAgent)) {
    return "Linux";
  }

  return "未知系统";
}

function detectOperatingSystemVersion(userAgent: string) {
  const patterns = [
    /Windows NT ([\d.]+)/,
    /Android ([\d.]+)/,
    /OS ([\d_]+) like Mac OS X/,
    /Mac OS X ([\d_]+)/,
  ];

  for (const pattern of patterns) {
    const match = userAgent.match(pattern);

    if (match?.[1]) {
      return match[1].replace(/_/g, ".");
    }
  }

  return "-";
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    null
  );
}
