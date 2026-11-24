import torch.nn as nn
import torch.nn.functional as functional


class BrainScanCNN(nn.Module):
    def __init__(self, num_classes: int = 4) -> None:
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc1 = nn.Linear(256, 512)
        self.dropout = nn.Dropout(p=0.5)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, value):
        value = self.pool(functional.relu(self.bn1(self.conv1(value))))
        value = self.pool(functional.relu(self.bn2(self.conv2(value))))
        value = self.pool(functional.relu(self.bn3(self.conv3(value))))
        value = self.pool(functional.relu(self.bn4(self.conv4(value))))
        value = self.global_pool(value)
        value = value.flatten(1)
        value = functional.relu(self.fc1(value))
        value = self.dropout(value)
        return self.fc2(value)
