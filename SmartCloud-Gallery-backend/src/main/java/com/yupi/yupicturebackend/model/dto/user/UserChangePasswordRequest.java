package com.yupi.yupicturebackend.model.dto.user;

import com.yupi.yupicturebackend.common.PageRequest;
import lombok.Data;

import java.io.Serializable;

@Data
public class UserChangePasswordRequest extends PageRequest implements Serializable {

    private String oldPassword;

    private String newPassword;

    private String checkPassword;
}