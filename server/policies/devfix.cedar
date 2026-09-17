// 1. Explicitly forbid reading environment secrets
forbid (
    principal == Aegis::Agent::"DevFix_Test",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::".env"
);

// 2. Explicitly forbid DevFix from reading environment secrets
forbid (
    principal == Aegis::Agent::"DevFix",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::".env"
);

// 3. Permit explicitly allowed file reads for test runner
permit (
    principal == Aegis::Agent::"DevFix_Test",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::"package.json"
);

// 4. Permit package.json read for reference agent
permit (
    principal == Aegis::Agent::"DevFix",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::"package.json"
);

// 5. Permit package-lock.json read
permit (
    principal == Aegis::Agent::"DevFix",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::"package-lock.json"
);

// 6. Permit external dependency documentation read
permit (
    principal == Aegis::Agent::"DevFix",
    action == Aegis::Action::"fs:read",
    resource == Aegis::File::"node_modules/axios/README.md"
);
