package com.yupi.yupicturebackend.utils;

import cn.hutool.core.util.StrUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;
import java.util.Map;

@Slf4j
public class JwtUtils {

    private static final String SECRET_KEY = "aXRoZWltYQ=="; // 秘钥
    private static final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24小时

    /**
     * 生成JWT令牌
     * 
     * @param subject 令牌主题（用户ID）
     * @return 生成的JWT令牌字符串
     */
    public static String generateToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .compact();
    }

    /**
     * 生成JWT令牌（带自定义claims）
     * 
     * @param claims 令牌中包含的信息
     * @return 生成的JWT令牌字符串
     */
    public static String generateToken(Map<String, Object> claims) {
        return Jwts.builder()
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .addClaims(claims)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .compact();
    }

    /**
     * 解析JWT令牌
     * 
     * @param token 要解析的JWT令牌字符串
     * @return 包含令牌信息的Claims对象
     * @throws Exception 如果令牌无效或已过期，则抛出异常
     */
    public static Claims parseToken(String token) throws Exception {
        if (StrUtil.isBlank(token)) {
            throw new Exception("Invalid token: blank or null");
        }

        log.info("Parsing token: {}", token);

        try {
            // 如果token以Bearer 开头，去掉这个前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.error("JWT 解析失败", e);
            throw new Exception("Invalid JWT token", e);
        } catch (Exception e) {
            log.error("Unexpected error parsing token", e);
            throw new Exception("Unable to parse token", e);
        }
    }

    /**
     * 刷新JWT令牌
     * 
     * @param token 原令牌
     * @return 新的JWT令牌字符串
     * @throws Exception 如果原令牌无效或已过期，则抛出异常
     */
    public static String refreshToken(String token) throws Exception {
        Claims claims = parseToken(token);
        // 生成新的token，保持相同的subject
        return generateToken(claims.getSubject());
    }
}