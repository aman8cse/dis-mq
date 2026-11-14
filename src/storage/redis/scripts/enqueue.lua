local sequence = redis.call("INCR", KEYS[2])

local member = string.format("%016d", sequence) .. ":" .. ARGV[2]

redis.call("ZADD", KEYS[1], -tonumber(ARGV[1]), member)

return sequence